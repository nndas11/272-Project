# pip install yfinance pandas psycopg2-binary
import os
import psycopg2
import pandas as pd
import yfinance as yf
from dotenv import load_dotenv
load_dotenv()
# ---------- DB CONFIG ----------
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT"))
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA", "NFLX"]

# ---------- LABEL MAPPINGS (Yahoo -> your column name) ----------
INC_MAP = {
    "Total Revenue": "total_revenue",
    "Cost Of Revenue": "cost_of_revenue",
    "Gross Profit": "gross_profit",
    "Research Development": "research_and_development",
    "Selling General Administrative": "selling_general_admin",
    "Operating Income": "operating_income",
    "Interest Expense": "interest_expense",
    "Income Before Tax": "income_before_tax",
    "Income Tax Expense": "income_tax_expense",
    "Net Income": "net_income",
    "Diluted EPS": "diluted_eps",
}

BAL_MAP = {
    "Cash And Cash Equivalents": "cash_and_cash_equivalents",
    "Short Term Investments": "short_term_investments",
    "Net Receivables": "accounts_receivable",
    "Inventory": "inventory",
    "Total Current Assets": "total_current_assets",
    "Property Plant Equipment": "property_plant_equipment_net",
    "Good Will": "goodwill",
    "Total Assets": "total_assets",
    "Accounts Payable": "accounts_payable",
    "Short Long Term Debt": "short_long_term_debt_total",
    "Total Current Liabilities": "total_current_liabilities",
    "Total Liab": "total_liabilities",
    "Total Stockholder Equity": "total_shareholder_equity",
    "Retained Earnings": "retained_earnings",
}

CF_MAP = {
    "Total Cash From Operating Activities": "net_cash_from_operating_activities",
    "Capital Expenditures": "capital_expenditures",
    "Total Cashflows From Investing Activities": "net_cash_from_investing_activities",
    "Total Cash From Financing Activities": "net_cash_from_financing_activities",
    "Dividends Paid": "dividends_paid",
    "Repurchase Of Stock": "repurchase_of_stock",
}

def upsert_company(cur, symbol: str, tk: yf.Ticker) -> int:
    """Ensure a row exists in companies and return companies_id."""
    # Try to find existing
    cur.execute("SELECT companies_id FROM companies WHERE symbol=%s", (symbol,))
    row = cur.fetchone()
    if row:
        return row[0]

    info = tk.info or {}
    long_name = info.get("longName") or info.get("shortName") or symbol

    # Insert minimal row (other cols can remain NULL)
    cur.execute(
        """
        INSERT INTO companies (longName, symbol)
        VALUES (%s, %s)
        RETURNING companies_id
        """,
        (long_name, symbol)
    )
    return cur.fetchone()[0]

def prep_rows(df: pd.DataFrame, mapping: dict, period_type: str, company_id: int):
    """
    Convert a yfinance statement DF (rows=labels, cols=period end dates)
    into list[dict] matching our target schema. Only mapped labels are kept.
    """
    if df is None or df.empty:
        return []

    keep = [raw for raw in mapping.keys() if raw in df.index]
    if not keep:
        return []

    # rename label rows to our canonical column names and transpose
    df2 = df.loc[keep].rename(index=mapping).T
    df2.index = pd.to_datetime(df2.index).date  # fiscal period end dates

    rows = []
    for period_end, row in df2.iterrows():
        rec = {
            "company_id": company_id,
            "period_end_date": period_end,
            "period_type": period_type
        }
        for col in df2.columns:
            val = row.get(col)
            rec[col] = None if pd.isna(val) else float(val)
        rows.append(rec)
    return rows

def insert_income_statement(cur, rows):
    if not rows:
        return
    cols = [
        "company_id","period_end_date","period_type",
        "total_revenue","cost_of_revenue","gross_profit","research_and_development",
        "selling_general_admin","operating_income","interest_expense","income_before_tax",
        "income_tax_expense","net_income","diluted_eps"
    ]
    sql = f"""
        INSERT INTO income_statement ({", ".join(cols)})
        VALUES ({", ".join(["%s"]*len(cols))})
    """
    cur.executemany(sql, [[r.get(c) for c in cols] for r in rows])

def insert_balance_sheet(cur, rows):
    if not rows:
        return
    cols = [
        "company_id","period_end_date","period_type",
        "cash_and_cash_equivalents","short_term_investments","accounts_receivable","inventory",
        "total_current_assets","property_plant_equipment_net","goodwill","total_assets",
        "accounts_payable","short_long_term_debt_total","total_current_liabilities",
        "total_liabilities","total_shareholder_equity","retained_earnings"
    ]
    sql = f"""
        INSERT INTO balance_sheet ({", ".join(cols)})
        VALUES ({", ".join(["%s"]*len(cols))})
    """
    cur.executemany(sql, [[r.get(c) for c in cols] for r in rows])

def insert_cash_flow(cur, rows):
    if not rows:
        return
    # compute FCF = CFO - Capex
    for r in rows:
        cfo = r.get("net_cash_from_operating_activities")
        capex = r.get("capital_expenditures")
        r["free_cash_flow"] = (cfo - capex) if (cfo is not None and capex is not None) else None

    cols = [
        "company_id","period_end_date","period_type",
        "net_cash_from_operating_activities","capital_expenditures",
        "net_cash_from_investing_activities","net_cash_from_financing_activities",
        "dividends_paid","repurchase_of_stock","free_cash_flow"
    ]
    sql = f"""
        INSERT INTO cash_flow ({", ".join(cols)})
        VALUES ({", ".join(["%s"]*len(cols))})
    """
    cur.executemany(sql, [[r.get(c) for c in cols] for r in rows])

def load_symbol(cur, symbol: str):
    tk = yf.Ticker(symbol)
    company_id = upsert_company(cur, symbol, tk)

    # Prepare rows for both annual and quarterly
    ann_inc = prep_rows(tk.financials, INC_MAP, "annual", company_id)
    qtr_inc = prep_rows(tk.quarterly_financials, INC_MAP, "quarterly", company_id)

    ann_bal = prep_rows(tk.balance_sheet, BAL_MAP, "annual", company_id)
    qtr_bal = prep_rows(tk.quarterly_balance_sheet, BAL_MAP, "quarterly", company_id)

    ann_cf  = prep_rows(tk.cashflow, CF_MAP, "annual", company_id)
    qtr_cf  = prep_rows(tk.quarterly_cashflow, CF_MAP, "quarterly", company_id)

    # Clear existing rows for this company to avoid duplicates
    cur.execute("DELETE FROM income_statement WHERE company_id=%s", (company_id,))
    cur.execute("DELETE FROM balance_sheet   WHERE company_id=%s", (company_id,))
    cur.execute("DELETE FROM cash_flow       WHERE company_id=%s", (company_id,))

    # Insert fresh data
    insert_income_statement(cur, ann_inc + qtr_inc)
    insert_balance_sheet(cur, ann_bal + qtr_bal)
    insert_cash_flow(cur, ann_cf + qtr_cf)

def main():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME
    )
    try:
        with conn:
            with conn.cursor() as cur:
                for sym in SYMBOLS:
                    print(f"Loading {sym} …")
                    load_symbol(cur, sym)
                print("Done.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()

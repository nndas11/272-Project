import os
import yfinance as yf
import psycopg2
from dotenv import load_dotenv
# List of stock symbols
symbols = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA", "NFLX"]
load_dotenv()
# Read PostgreSQL details from .env
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_PORT = os.getenv("DB_PORT", "5432")

print(DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT)
# Connect to PostgreSQL
conn = psycopg2.connect(
    host=DB_HOST,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    port=DB_PORT
)
cur = conn.cursor()

# Loop through each company and fetch info
for symbol in symbols:
    ticker = yf.Ticker(symbol)
    info = ticker.info

    # Extract key fields with safe .get() access
    longName = info.get("longName")
    sector = info.get("sector")
    industry = info.get("industry")
    country = info.get("country")
    marketCap = info.get("marketCap")
    dividendYield = info.get("dividendYield")
    trailingPE = info.get("trailingPE")
    beta = info.get("beta")
    website = info.get("website")

    # Insert into companies table
    cur.execute("""
        INSERT INTO companies (
            longName, Symbol, sector, industry, country,
            marketCap, dividendYield, trailingPE, beta, website
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (longName, symbol, sector, industry, country,
         marketCap, dividendYield, trailingPE, beta, website)
    )

    print(f"Inserted data for {symbol}")


users = [
    ("Alice Johnson", "alice.johnson@example.com", "pbkdf2_sha256$260000$abc123$xyz890", "2025-11-01 10:15:30"),
    ("Bob Smith", "bob.smith@example.com", "pbkdf2_sha256$260000$def456$pqr567", "2025-11-03 14:22:10"),
    ("Charlie Brown", "charlie.brown@example.com", "pbkdf2_sha256$260000$ghi789$stu234", "2025-11-05 09:45:55"),
    ("Diana Lee", "diana.lee@example.com", "pbkdf2_sha256$260000$jkl012$vwx678", "2025-11-07 18:30:40"),
    ("Ethan Williams", "ethan.williams@example.com", "pbkdf2_sha256$260000$mno345$yz012", "2025-11-10 07:55:20")
]

# --- Insert data ---
try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cursor = conn.cursor()

    # Insert query
    insert_query = """
        INSERT INTO users (full_name, email, password_hash, created_at)
        VALUES (%s, %s, %s, %s)
    """

    # Execute insert for all rows
    cursor.executemany(insert_query, users)

    # Commit changes
    conn.commit()
    print(f"{cursor.rowcount} records inserted successfully!")

except Exception as e:
    print("❌ Error inserting data:", e)

# Commit changes and close connection
conn.commit()
cur.close()
conn.close()


print("✅ All company data inserted successfully!")

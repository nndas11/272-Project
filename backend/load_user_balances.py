import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Read PostgreSQL details from .env
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_PORT = os.getenv("DB_PORT", "5432")

print(f"Connecting to {DB_HOST}:{DB_PORT}/{DB_NAME}...")

try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    cur = conn.cursor()

    # First, get all users from the users table
    cur.execute("SELECT user_id, full_name FROM users")
    users = cur.fetchall()
    
    if not users:
        print("❌ No users found in users table. Please run load_file.py first.")
        conn.close()
        exit(1)
    
    print(f"Found {len(users)} users. Adding balances...")
    
    # Sample balance data for each user (in USD)
    sample_balances = {
        1: 50000.00,
        2: 75000.00,
        3: 100000.00,
        4: 125000.00,
        5: 150000.00,
    }
    
    inserted_count = 0
    for user_id, full_name in users:
        # Get balance amount from sample data or use default
        balance_amount = sample_balances.get(user_id, 100000.00)
        
        # Check if balance already exists for this user
        cur.execute("SELECT id FROM user_balances WHERE user_id=%s AND currency='USD'", (user_id,))
        existing = cur.fetchone()
        
        if existing:
            print(f"  ⚠️  Balance already exists for {full_name} (ID: {user_id}). Skipping...")
            continue
        
        # Insert balance record
        cur.execute("""
            INSERT INTO user_balances (user_id, currency, available_balance, total_balance)
            VALUES (%s, %s, %s, %s)
        """, (user_id, "USD", balance_amount, balance_amount))
        
        print(f"  ✅ Added ${balance_amount:,.2f} USD balance for {full_name} (ID: {user_id})")
        inserted_count += 1
    
    conn.commit()
    print(f"\n✅ Successfully inserted {inserted_count} user balance records!")
    
except psycopg2.Error as e:
    print(f"❌ Database error: {e}")
    conn.rollback()
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    if conn:
        cur.close()
        conn.close()

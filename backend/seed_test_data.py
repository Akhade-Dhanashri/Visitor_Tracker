#!/usr/bin/env python3
"""
Database setup script to add test data to users table and visitors table
"""

import sys
import os
import random
from datetime import datetime, timedelta

# Ensure we can import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api_server import get_db_connection

def seed_test_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        print("Connected to database successfully")

        # 1. Seed Users
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]

        if user_count == 0:
            print("Adding test users...")
            test_users = [
                {
                    'name': 'Admin Dhanashri',
                    'email': 'akhadedhanashri@gmail.com',
                    'password': 'Dhanashri@2026', 
                    'role': 'admin',
                    'status': 'Active'
                },
                {
                    'name': 'Security Guard 1',
                    'email': 'guard1@rachana.org',
                    'password': 'guard123',
                    'role': 'security',
                    'status': 'Active'
                },
                {
                    'name': 'Security Guard 2',
                    'email': 'guard2@rachana.org',
                    'password': 'guard123',
                    'role': 'security',
                    'status': 'Active'
                }
            ]

            now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            for user in test_users:
                cursor.execute("""
                    INSERT INTO users (name, email, password, role, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    user['name'],
                    user['email'],
                    user['password'],
                    user['role'],
                    user['status'],
                    now,
                    now
                ))
                print(f"  ✓ Created user: {user['name']} ({user['email']})")
        else:
             print(f"✓ Users already exist ({user_count}). Skipping user seed.")


        # 2. Seed Visitors (Crucial for Analytics Verification)
        cursor.execute("SELECT COUNT(*) FROM visitors")
        visitor_count = cursor.fetchone()[0]
        
        # Only seed if very few visitors exist (e.g. fresh DB)
        if visitor_count < 5:
            print("Adding sample visitor data for Analytics verification...")
            
            # Helper to add visitor
            def add_visitor(name, purpose, time_offset_hours=0, time_offset_days=0, checked_out=True):
                check_in = datetime.now() - timedelta(days=time_offset_days, hours=time_offset_hours)
                check_in_str = check_in.strftime('%Y-%m-%d %H:%M:%S')
                
                check_out_str = None
                if checked_out:
                    check_out_time = check_in + timedelta(minutes=random.randint(20, 120))
                    check_out_str = check_out_time.strftime('%Y-%m-%d %H:%M:%S')

                cursor.execute("""
                    INSERT INTO visitors (name, email, phone, purpose, check_in_time, check_out_time, host_name, company)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    name, 
                    f"{name.replace(' ', '.').lower()}@example.com", 
                    f"98765{random.randint(10000, 99999)}",
                    purpose,
                    check_in_str,
                    check_out_str,
                    "Host Person",
                    "Company Inc"
                ))

            # Today's Data (Hourly distribution)
            print("  Seeding Today's visitors...")
            for i in range(1, 10): # 10 visitors today
                add_visitor(f"Visitor Today {i}", random.choice(["Meeting", "Interview", "Delivery"]), time_offset_hours=i, checked_out=(i % 3 != 0))

            # Yesterday's Data
            print("  Seeding Yesterday's visitors...")
            for i in range(1, 8):
                 add_visitor(f"Visitor Yest {i}", "Meeting", time_offset_days=1, time_offset_hours=random.randint(1, 8))

            # Last Week Data
            print("  Seeding Last Week's visitors...")
            for i in range(1, 20):
                 add_visitor(f"Visitor Week {i}", random.choice(["Meeting", "Vendor"]), time_offset_days=random.randint(2, 6), time_offset_hours=random.randint(1, 8))

            # Last Month Data
            print("  Seeding Last Month's visitors...")
            for i in range(1, 15):
                 add_visitor(f"Visitor Month {i}", "Interview", time_offset_days=random.randint(10, 25), time_offset_hours=random.randint(1, 8))

            print("✓ Added sample visitor data for Today, Yesterday, Weekly, and Monthly graphs.")
        else:
             print(f"✓ Visitors already exist ({visitor_count}). Skipping visitor seed.")

        conn.commit()
        conn.close()
        return True

    except Exception as e:
        print(f"✗ Error seeding test data: {e}")
        return False

if __name__ == '__main__':
    success = seed_test_data()
    sys.exit(0 if success else 1)

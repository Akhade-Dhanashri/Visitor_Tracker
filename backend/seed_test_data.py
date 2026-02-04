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

        conn.commit()
        conn.close()
        return True

    except Exception as e:
        print(f"✗ Error seeding test data: {e}")
        return False

if __name__ == '__main__':
    success = seed_test_data()
    sys.exit(0 if success else 1)

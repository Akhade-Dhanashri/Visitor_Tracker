#!/usr/bin/env python3
"""
Database setup script to add test data to users table
"""

import sqlite3
from datetime import datetime
import hashlib

def seed_test_data():
    try:
        db_path = r'c:\Visitor_Tracker\backend\database\database.sqlite'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("Connected to database successfully")

        # Check if users already exist
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]

        if count > 0:
            print(f"✓ Database already has {count} users. Skipping seed data.")
            conn.close()
            return True

        print("Adding test users...")

        # Create test users
        test_users = [
            {
                'name': 'Admin Dhanashri',
                'email': 'akhadedhanashri@gmail.com',
                'password': 'Dhanashri@2026',  # Will be hashed by Laravel
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
            # In production, passwords should be hashed
            # For now, we'll store them in plain text (NOT RECOMMENDED for production)
            cursor.execute("""
                INSERT INTO users (name, email, password, role, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                user['name'],
                user['email'],
                user['password'],  # Should be hashed in production
                user['role'],
                user['status'],
                now,
                now
            ))
            print(f"  ✓ Created user: {user['name']} ({user['email']})")

        conn.commit()

        # Verify
        cursor.execute("SELECT COUNT(*) FROM users")
        new_count = cursor.fetchone()[0]
        print(f"\n✓ Successfully added {new_count - count} test users!")

        # Show all users
        cursor.execute("SELECT id, name, email, role, status FROM users")
        print("\nAll users in database:")
        for row in cursor.fetchall():
            print(f"  ID: {row[0]}, Name: {row[1]}, Email: {row[2]}, Role: {row[3]}, Status: {row[4]}")

        conn.close()
        return True

    except Exception as e:
        print(f"✗ Error seeding test data: {e}")
        return False

if __name__ == '__main__':
    import sys
    success = seed_test_data()
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
Database migration script to add role and status columns to users table
"""

import sqlite3
import sys

def migrate_database():
    try:
        # Connect to the SQLite database
        db_path = r'c:\Visitor_Tracker\backend\database\database.sqlite'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("Connected to database successfully")

        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = {row[1] for row in cursor.fetchall()}

        print(f"Existing columns: {columns}")

        # Add role column if it doesn't exist
        if 'role' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'security'")
            print("✓ Added 'role' column")
        else:
            print("✓ 'role' column already exists")

        # Add status column if it doesn't exist
        if 'status' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'Active'")
            print("✓ Added 'status' column")
        else:
            print("✓ 'status' column already exists")

        # Commit changes
        conn.commit()
        print("\n✓ Database migration completed successfully!")

        # Show updated schema
        cursor.execute("PRAGMA table_info(users)")
        print("\nUpdated users table schema:")
        for row in cursor.fetchall():
            print(f"  - {row[1]} ({row[2]})")

        conn.close()
        return True

    except Exception as e:
        print(f"✗ Error during migration: {e}")
        return False

if __name__ == '__main__':
    success = migrate_database()
    sys.exit(0 if success else 1)

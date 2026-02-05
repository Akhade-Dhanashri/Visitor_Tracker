#!/usr/bin/env python3
"""
Visitor Tracker Backend API Server (Mock/Standalone)
Simulates Laravel API without needing PHP/Docker
Supports full user management with SQLite backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import json
from datetime import datetime, timedelta
from functools import wraps
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets
import pandas as pd
import io
import csv
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database configuration
DB_FILE = os.getenv('DB_FILE', 'api_server.db')

def get_db_connection():
    """Get database connection (Strict PostgreSQL Only)"""
    # Resolve URL at runtime to ensure latest Env Vars are picked up
    db_url = os.getenv('DATABASE_URL') or os.getenv('Database_URL')
    
    if not db_url:
        # Halt execution if NO DB URL is present
        raise RuntimeError("CRITICAL ERROR: DATABASE_URL environment variable is not set. Application cannot start without a PostgreSQL database (SQLite fallback disabled to prevent data loss).")
        
    if not psycopg2:
        # Halt execution if driver is missing
        raise RuntimeError("CRITICAL ERROR: psycopg2 driver not installed. Cannot connect to PostgreSQL.")

    try:
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to connect to PostgreSQL: {e}")
        raise RuntimeError(f"Database connection failed: {e}")

def execute_query(cursor, query, params=None):
    """Execute query handling placeholder differences"""
    if params is None:
        params = ()
        
    # Check if this is a psycopg2 cursor
    is_postgres = hasattr(cursor, 'query') or (psycopg2 and isinstance(cursor, psycopg2.extensions.cursor))
    
    if is_postgres:
        # Convert ? to %s for Postgres
        # Note: This is a simple replacement. Complex queries might need careful handling.
        query = query.replace('?', '%s')
        cursor.execute(query, params)
    else:
        cursor.execute(query, params)

def get_row_dict(row, cursor):
    """Convert row to dict compatible with both drivers"""
    if hasattr(row, 'keys'): # SQLite Row
        return dict(row)
    if isinstance(row, dict): # Psycopg2 RealDictCursor
        return row
    # Psycopg2 normal cursor (tuple) - need column names
    col_names = [desc[0] for desc in cursor.description]
    return dict(zip(col_names, row))


# Email configuration
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_EMAIL = os.getenv('SMTP_EMAIL')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')

if not SMTP_EMAIL or not SMTP_PASSWORD:
    print("WARNING: Email credentials not set in .env file. Email sending will fail.")

def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    
    # Check if postgres
    # Since we enforce DATABASE_URL and psycopg2 in get_db_connection, 
    # we can assume it is Postgres. Using AUTOINCREMENT will fail on Postgres.
    is_postgres = True
    print(f"INFO: Initializing PostgreSQL database (Strict Mode)")
        
    cursor = conn.cursor()

    # Create users table
    id_type = "SERIAL PRIMARY KEY" if is_postgres else "INTEGER PRIMARY KEY AUTOINCREMENT"
    
    execute_query(cursor, f"""
        CREATE TABLE IF NOT EXISTS users (
            id {id_type},
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'security',
            status TEXT DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create visitors table
    execute_query(cursor, f"""
        CREATE TABLE IF NOT EXISTS visitors (
            id {id_type},
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            purpose TEXT NOT NULL,
            check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            check_out_time TIMESTAMP,
            host_name TEXT,
            company TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create settings table
    execute_query(cursor, f"""
        CREATE TABLE IF NOT EXISTS settings (
            id {id_type},
            organization_name TEXT DEFAULT 'Rachana Girls Hostel',
            email TEXT DEFAULT 'contact@rachana.org',
            phone TEXT DEFAULT '+91 22 1234 5678',
            push_notifications BOOLEAN DEFAULT 0,
            email_notifications BOOLEAN DEFAULT 0,
            auto_checkout BOOLEAN DEFAULT 0,
            require_email BOOLEAN DEFAULT 0,
            require_organization BOOLEAN DEFAULT 0
        )
    """)
    
    # Check for reset_token columns and add if missing (DB Migration)
    # This ensures deployment preserves existing users but adds new capabilities
    try:
        # Try to select the column to see if it exists
        execute_query(cursor, "SELECT reset_token FROM users LIMIT 1")
    except Exception:
        # Column likely missing, add them
        print("INFO: Migrating database - adding reset_token columns")
        try:
            execute_query(cursor, "ALTER TABLE users ADD COLUMN reset_token TEXT")
            execute_query(cursor, "ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP")
        except Exception as e:
            print(f"WARNING: Database migration failed (columns might ensure exist): {e}")

    # Ensure default settings exist
    execute_query(cursor, "SELECT COUNT(*) FROM settings")
    if cursor.fetchone()[0] == 0:
        execute_query(cursor, """
            INSERT INTO settings (id, organization_name, email, phone) 
            VALUES (1, 'Rachana Girls Hostel', 'contact@rachana.org', '+91 22 1234 5678')
        """)

    # Check if seed data exists
    execute_query(cursor, "SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]

    # Always ensure the main admin exists, even if other users exist
    admin_email = "akhadedhanashri@gmail.com"
    execute_query(cursor, "SELECT id FROM users WHERE email = ?", (admin_email,))
    existing_admin = cursor.fetchone()

    if not existing_admin:
        print(f"INFO: Creating main admin user {admin_email}")
        execute_query(cursor, """
            INSERT INTO users (name, email, password, role, status)
            VALUES (?, ?, ?, ?, ?)
        """, ("Admin Dhanashri", admin_email, "Dhanashri@2026", "admin", "Active"))
    
    # Run comprehensive seeder if users are empty (first run)
    if count == 0:
        print("INFO: Database appears empty. Running initial user seed...")
        try:
            # We import here to avoid circular dependencies at top level if any
            from seed_test_data import seed_test_data
            seed_test_data()
            print("SUCCESS: Seeded initial users")
        except Exception as e:
            print(f"ERROR: Failed to run seeder: {e}")

    conn.commit()
    conn.close()

# get_db_connection is verified above

def validate_json(f):
    """Decorator to validate JSON requests"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        return f(*args, **kwargs)
    return decorated_function

# Health Check
@app.route("/api/health", methods=["GET"])
def health_check():
    """GET /api/health - Check API status and DB connection"""
    # Check both standard and typo versions
    db_url_present = bool(os.getenv('DATABASE_URL') or os.getenv('Database_URL'))
    is_postgres = False
    
    # Try connecting safely
    try:
        conn = get_db_connection()
        # Check robustly explicitly imported library or connection type
        if 'psycopg2' in str(type(conn)):
             is_postgres = True
        elif hasattr(conn, 'info') and conn.info.dsn_parameters:
             is_postgres = True
             
        cursor = conn.cursor()
        execute_query(cursor, "SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        execute_query(cursor, "SELECT COUNT(*) FROM visitors")
        visitor_count = cursor.fetchone()[0]
        conn.close()
        db_status = "Connected"
    except Exception as e:
        user_count = -1
        visitor_count = -1
        db_status = f"Error: {str(e)}"

    db_type = "PostgreSQL" if is_postgres else "SQLite (If Fallback Enabled)"
    
    # Return 200 even if DB fails, so we can see the JSON diagnostic
    return jsonify({
        "status": "ok",
        "database_type": db_type,
        "connection_status": db_status,
        "database_url_present": db_url_present,
        "psycopg2_installed": bool(psycopg2),
        "counts": {
            "users": user_count,
            "visitors": visitor_count
        }
    }), 200

# Auth endpoints
@app.route("/api/login", methods=["POST"])
@validate_json
def login():
    """POST /api/login - Authenticate user"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # In a real app, use bcrypt to verify hash. Here we compare plain text for demo simplicity as per seed data
        execute_query(cursor, "SELECT id, name, email, role, status FROM users WHERE email = ? AND password = ?", 
                      (data['email'], data['password']))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
            
        if user[4] != 'Active':
            return jsonify({"error": "Account is inactive"}), 403
            
        return jsonify({
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[3],
            "status": user[4]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/change-password", methods=["POST"])
@validate_json
def change_password():
    """POST /api/change-password - Change user password"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        if not user_id or not old_password or not new_password:
            return jsonify({"error": "Missing required fields"}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify old password
        execute_query(cursor, "SELECT password FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        
        if not user_row:
            conn.close()
            return jsonify({"error": "User not found"}), 404
            
        current_db_password = user_row[0]
        
        # Simple comparison (replace with hash check in production)
        if current_db_password != old_password:
            conn.close()
            return jsonify({"error": "Incorrect current password"}), 401
            
        # Update password
        execute_query(cursor, "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
                      (new_password, user_id))
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Password updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/forgot-password", methods=["POST"])
@validate_json
def forgot_password():
    """POST /api/forgot-password - Send password reset email"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # Check if user exists
        conn = get_db_connection()
        cursor = conn.cursor()
        execute_query(cursor, "SELECT id, name FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        # Always return success (don't reveal if email exists - security best practice)
        if user:
            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            expiry = datetime.now() + timedelta(hours=1)
            
            # Save token to DB
            execute_query(cursor, """
                UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?
            """, (reset_token, expiry, user[0]))
            conn.commit()
            
            # Send email
            try:
                send_reset_email(email, user[1], reset_token)
            except Exception as e:
                print(f"Email sending error: {e}")
                # Still return success to user/log the error
        
        conn.close()
        return jsonify({"message": "If email exists, reset link has been sent"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/reset-password", methods=["POST"])
@validate_json
def reset_password():
    """POST /api/reset-password - Reset password using token"""
    try:
        data = request.json
        token = data.get('token')
        new_password = data.get('new_password')
        
        if not token or not new_password:
            return jsonify({"error": "Token and new password are required"}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify token in DB
        # SQLite returns columns by index
        reset_token_col = "reset_token"
        execute_query(cursor, "SELECT id, reset_token_expiry FROM users WHERE reset_token = ?", (token,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({"error": "Invalid or expired token"}), 400
            
        # Check expiry
        expiry_str = user[1] 
        
        # Parse timestamp
        if isinstance(expiry_str, str):
            try:
                 expiry = datetime.fromisoformat(expiry_str)
            except ValueError:
                 try:
                    expiry = datetime.strptime(expiry_str, '%Y-%m-%d %H:%M:%S.%f')
                 except:
                    try:
                        expiry = datetime.strptime(expiry_str, '%Y-%m-%d %H:%M:%S')
                    except:
                        # Last ditch effort for other formats? Or just fail safely
                        conn.close()
                        return jsonify({"error": "Token expiry format error"}), 500
        else:
            expiry = expiry_str

        if datetime.now() > expiry:
            conn.close()
            return jsonify({"error": "Token has expired"}), 400
            
        # Update password
        execute_query(cursor, """
            UPDATE users 
            SET password = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        """, (new_password, user[0]))
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Password has been reset successfully"}), 200
        
    except Exception as e:
        print(f"Reset password error: {e}")
        return jsonify({"error": "Failed to reset password"}), 500

def send_reset_email(to_email, user_name, reset_token):
    """Send password reset email via Gmail SMTP"""
    subject = "Password Reset - Rachana Visitor Tracker"
    
    # Create reset link
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    body = f"""Hello {user_name},

You requested a password reset for your Rachana Visitor Tracker account.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
Rachana Team
"""
    
    msg = MIMEMultipart()
    msg['From'] = SMTP_EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    server = None
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
    except Exception as e:
        print(f"SMTP Error: {e}")
        raise e
    finally:
        if server:
            try:
                server.quit()
            except:
                pass

# User endpoints
@app.route("/api/users", methods=["GET"])
def get_users():
    """GET /api/users - Get all users"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        execute_query(cursor, "SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        conn.close()

        user_list = []
        for user in users:
            user_list.append({
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[3],
                "status": user[4],
                "created_at": user[5],
                "updated_at": user[6]
            })

        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users", methods=["POST"])
@validate_json
def create_user():
    """POST /api/users - Create new user"""
    try:
        data = request.get_json()

        if not data or not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Name, email, and password are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        execute_query(cursor, """
            INSERT INTO users (name, email, password, role, status)
            VALUES (?, ?, ?, ?, ?)
        """, (
            data['name'],
            data['email'],
            data['password'],
            data.get('role', 'security'),
            data.get('status', 'Active')
        ))

        conn.commit()
        # id is available via lastrowid in sqlite, need separate handling for returning id in postgres
        # For simple compatibility, we can query by email (unique)
        
        execute_query(cursor, "SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE email = ?", (data['email'],))
        new_user = cursor.fetchone()
        conn.close()

        return jsonify({
            "id": new_user[0],
            "name": new_user[1],
            "email": new_user[2],
            "role": new_user[3],
            "status": new_user[4],
            "created_at": new_user[5],
            "updated_at": new_user[6]
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    """GET /api/users/{id} - Get user by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        execute_query(cursor, "SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[3],
            "status": user[4],
            "created_at": user[5],
            "updated_at": user[6]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<int:user_id>", methods=["PUT"])
@validate_json
def update_user(user_id):
    """PUT /api/users/{id} - Update user"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Build update query dynamically
        update_fields = []
        values = []

        if 'name' in data:
            update_fields.append("name = ?")
            values.append(data['name'])
        if 'email' in data:
            update_fields.append("email = ?")
            values.append(data['email'])
        if 'role' in data:
            update_fields.append("role = ?")
            values.append(data['role'])
        if 'status' in data:
            update_fields.append("status = ?")
            values.append(data['status'])
        if 'password' in data and data['password']:
            update_fields.append("password = ?")
            values.append(data['password'])

        if not update_fields:
            conn.close()
            return jsonify({"error": "No valid fields to update"}), 400

        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        values.append(user_id)

        execute_query(cursor, f"""
            UPDATE users
            SET {', '.join(update_fields)}
            WHERE id = ?
        """, tuple(values))

        conn.commit()

        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "User not found"}), 404

        conn.close()
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<int:user_id>/toggle-status", methods=["POST"])
def toggle_user_status(user_id):
    """POST /api/users/{id}/toggle-status - Toggle user active/inactive status"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get current status
        execute_query(cursor, "SELECT status FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

        if not user:
            conn.close()
            return jsonify({"error": "User not found"}), 404

        new_status = "Inactive" if user[0] == "Active" else "Active"

        execute_query(cursor, """
            UPDATE users
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (new_status, user_id))

        conn.commit()
        conn.close()

        return jsonify({"message": f"User status changed to {new_status}", "status": new_status}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/visitors/report", methods=["GET"])
def download_visitor_report():
    """GET /api/visitors/report - Export visitor data as CSV, Excel, or PDF"""
    try:
        format_type = request.args.get('format', 'csv').lower()
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM visitors"
        params = []
        conditions = []
        
        if start_date:
            conditions.append("check_in_time >= ?")
            # Append time to start of day if just date, but assuming frontend sends YYYY-MM-DD
            params.append(f"{start_date} 00:00:00")
            
        if end_date:
            conditions.append("check_in_time <= ?")
            # Append time to end of day
            params.append(f"{end_date} 23:59:59")
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += " ORDER BY check_in_time DESC"
        
        execute_query(cursor, query, tuple(params))
        visitors = cursor.fetchall()
        conn.close()
        
        # Prepare data list
        data = []
        columns = ["ID", "Name", "Email", "Phone", "Purpose", "Check-in", "Check-out", "Host", "Company", "Created", "Updated"]
        
        for v in visitors:
            data.append({
                "ID": v[0],
                "Name": v[1],
                "Email": v[2] or "",
                "Phone": v[3] or "",
                "Purpose": v[4],
                "Check-in": v[5] or "",
                "Check-out": v[6] or "",
                "Host": v[7] or "",
                "Company": v[8] or "",
                "Created": v[9] or "",
                "Updated": v[10] or ""
            })
            
        if not data:
             return jsonify({"error": "No visitor data found"}), 404

        if format_type == 'excel':
            # Generate Excel using pandas
            df = pd.DataFrame(data)
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Visitors')
            output.seek(0)
            
            return output.read(), 200, {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=visitors_report.xlsx'
            }
            
        elif format_type == 'pdf':
            # Generate PDF using reportlab
            output = io.BytesIO()
            doc = SimpleDocTemplate(output, pagesize=landscape(letter))
            elements = []
            
            styles = getSampleStyleSheet()
            elements.append(Paragraph("Visitor Report", styles['Title']))
            elements.append(Spacer(1, 12))
            
            # Prepare table data
            table_data = [columns[:9]] # Header, limiting columns to fit
            for item in data:
                row = [
                    str(item["ID"]),
                    item["Name"][:20], # Truncate long names
                    item["Email"][:20],
                    item["Phone"],
                    item["Purpose"],
                    item["Check-in"][:16], # Show date/time
                    item["Check-out"][:16] if item["Check-out"] else "",
                    item["Host"][:15],
                    item["Company"][:15]
                ]
                table_data.append(row)
                
            # Create Table
            t = Table(table_data)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0,0), (-1,-1), 1, colors.black),
                ('FONTSIZE', (0,0), (-1,-1), 8), # Smaller font
            ]))
            
            elements.append(t)
            doc.build(elements)
            output.seek(0)
            
            return output.read(), 200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=visitors_report.pdf'
            }

        else:
            # Default to CSV
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=columns)
            writer.writeheader()
            writer.writerows(data)
            
            return output.getvalue(), 200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=visitors_report.csv'
            }

    except Exception as e:
        print(f"Export error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    """DELETE /api/users/{id} - Delete user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        execute_query(cursor, "DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()

        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "User not found"}), 404

        conn.close()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Visitor endpoints
@app.route("/api/visitors", methods=["GET"])
def get_visitors():
    """GET /api/visitors - Get all visitors"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        execute_query(cursor, "SELECT * FROM visitors ORDER BY check_in_time DESC")
        visitors = cursor.fetchall()
        conn.close()

        visitor_list = []
        for visitor in visitors:
            visitor_list.append({
                "id": visitor[0],
                "name": visitor[1],
                "email": visitor[2],
                "phone": visitor[3],
                "purpose": visitor[4],
                "check_in_time": f"{visitor[5]}Z" if visitor[5] else None,
                "check_out_time": f"{visitor[6]}Z" if visitor[6] else None,
                "host_name": visitor[7],
                "company": visitor[8],
                "created_at": f"{visitor[9]}Z" if visitor[9] else None,
                "updated_at": f"{visitor[10]}Z" if visitor[10] else None
            })

        return jsonify(visitor_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/visitors", methods=["POST"])
@validate_json
def create_visitor():
    """POST /api/visitors - Create new visitor"""
    try:
        data = request.get_json()

        if not data or not data.get('name') or not data.get('purpose'):
            return jsonify({"error": "Name and purpose are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        execute_query(cursor, """
            INSERT INTO visitors (name, email, phone, purpose, host_name, company)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data['name'],
            data.get('email'),
            data.get('phone'),
            data['purpose'],
            data.get('host_name'),
            data.get('company')
        ))

        conn.commit()
        # Fetch mostly recently created visitor for this purpose and name
        # (Avoiding lastrowid/returning for cross-db simplicity on insert only)
        execute_query(cursor, "SELECT * FROM visitors WHERE name = ? AND purpose = ? ORDER BY id DESC LIMIT 1", (data['name'], data['purpose']))
        new_visitor = cursor.fetchone()
        conn.close()

        return jsonify({
            "id": new_visitor[0],
            "name": new_visitor[1],
            "email": new_visitor[2],
            "phone": new_visitor[3],
            "purpose": new_visitor[4],
            "check_in_time": f"{new_visitor[5]}Z" if new_visitor[5] else None,
            "check_out_time": f"{new_visitor[6]}Z" if new_visitor[6] else None,
            "host_name": new_visitor[7],
            "company": new_visitor[8],
            "created_at": f"{new_visitor[9]}Z" if new_visitor[9] else None,
            "updated_at": f"{new_visitor[10]}Z" if new_visitor[10] else None
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/visitors/<int:visitor_id>", methods=["GET"])
def get_visitor(visitor_id):
    """GET /api/visitors/{id} - Get visitor by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        execute_query(cursor, "SELECT * FROM visitors WHERE id = ?", (visitor_id,))
        visitor = cursor.fetchone()
        conn.close()

        if not visitor:
            return jsonify({"error": "Visitor not found"}), 404

        return jsonify({
            "id": visitor[0],
            "name": visitor[1],
            "email": visitor[2],
            "phone": visitor[3],
            "purpose": visitor[4],
            "check_in_time": f"{visitor[5]}Z" if visitor[5] else None,
            "check_out_time": f"{visitor[6]}Z" if visitor[6] else None,
            "host_name": visitor[7],
            "company": visitor[8],
            "created_at": f"{visitor[9]}Z" if visitor[9] else None,
            "updated_at": f"{visitor[10]}Z" if visitor[10] else None
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/visitors/<int:visitor_id>/checkout", methods=["POST"])
def checkout_visitor(visitor_id):
    """POST /api/visitors/{id}/checkout - Check out visitor"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        execute_query(cursor, """
            UPDATE visitors
            SET check_out_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND check_out_time IS NULL
        """, (visitor_id,))

        conn.commit()

        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Visitor not found or already checked out"}), 404

        conn.close()
        return jsonify({"message": "Visitor checked out successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/visitors/<int:visitor_id>", methods=["DELETE"])
def delete_visitor(visitor_id):
    """DELETE /api/visitors/{id} - Delete visitor"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        execute_query(cursor, "DELETE FROM visitors WHERE id = ?", (visitor_id,))
        conn.commit()

        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Visitor not found"}), 404

        conn.close()
        return jsonify({"message": "Visitor deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Settings endpoints
@app.route("/api/settings", methods=["GET"])
def get_settings():
    """GET /api/settings - Get system settings"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        execute_query(cursor, "SELECT * FROM settings WHERE id = 1")
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"error": "Settings not initialized"}), 500
            
        settings = {
            "organizationName": row[1],
            "email": row[2],
            "phone": row[3],
            "pushNotifications": bool(row[4]),
            "emailNotifications": bool(row[5]),
            "autoCheckout": bool(row[6]),
            "requireEmail": bool(row[7]),
            "requireOrganization": bool(row[8])
        }
        return jsonify(settings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/settings", methods=["PUT"])
@validate_json
def update_settings():
    """PUT /api/settings - Update system settings"""
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Determine strictness of booleans based on DB type (Postgres needs explicit bools usually, SQLite 0/1)
        # However, Python SQLite adapter handles bools as 0/1. Postgres adapter handles bools as True/False.
        # execute_query abstraction handles some, but let's pass raw values and let driver handle.
        
        execute_query(cursor, """
            UPDATE settings SET
                organization_name = ?,
                email = ?,
                phone = ?,
                push_notifications = ?,
                email_notifications = ?,
                auto_checkout = ?,
                require_email = ?,
                require_organization = ?
            WHERE id = 1
        """, (
            data.get('organizationName'),
            data.get('email'),
            data.get('phone'),
            data.get('pushNotifications'),
            data.get('emailNotifications'),
            data.get('autoCheckout'),
            data.get('requireEmail'),
            data.get('requireOrganization')
        ))
        
        conn.commit()
        conn.close()
        return jsonify({"message": "Settings updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Static file serving for docs
@app.route("/", methods=["GET"])
def index():
    """Serve API documentation"""
    return jsonify({
        "app": "Visitor Tracker Backend API",
        "version": "1.0.0",
        "endpoints": {
            "GET /api/users": "List all users",
            "POST /api/users": "Create new user",
            "GET /api/users/{id}": "Get user by ID",
            "PUT /api/users/{id}": "Update user",
            "POST /api/users/{id}/toggle-status": "Toggle user status",
            "DELETE /api/users/{id}": "Delete user",
            "GET /api/visitors": "List all visitors",
            "POST /api/visitors": "Create new visitor",
            "GET /api/visitors/{id}": "Get visitor by ID",
            "POST /api/visitors/{id}/checkout": "Check out visitor",
            "GET /api/visitors/report": "Download visitor report",
            "DELETE /api/visitors/{id}": "Delete visitor",
            "GET /api/health": "Health check"
        }
    }), 200

# Debug endpoint to force init (since startup init might fail if env vars aren't ready)
@app.route("/api/debug/init", methods=["GET"])
def debug_init():
    """GET /api/debug/init - Force database initialization"""
    try:
        init_db()
        return jsonify({"message": "Database initialized successfully (Tables created/verified)"}), 200
    except Exception as e:
        return jsonify({"error": f"Initialization failed: {str(e)}"}), 500

# Initialize database on startup (for both local and production Gunicorn)
print("Initializing database...")
try:
    with app.app_context():
        init_db()
    print("SUCCESS: Database initialized")
except Exception as e:
    print(f"WARNING: Database initialization failed: {e}")

if __name__ == "__main__":
    print("="*50)
    print("  Visitor Tracker Backend API Server")
    print("="*50)
    print()

    # Initialize database
    print("Initializing database...")
    init_db()
    print("SUCCESS: Database ready: SQLite")
    print()

    print("Starting Flask server...")
    print("Listening on: http://localhost:8000")
    print("API endpoints: http://localhost:8000/api/users")
    print()
    print("Press Ctrl+C to stop")
    print("="*50)
    print()

    # Start server
    app.run(host="0.0.0.0", port=8000, debug=True)

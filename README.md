# Visitor Tracker Application

A comprehensive visitor management system built with React (Frontend) and Flask (Backend).

## Features
- **Visitor Check-in/Check-out:** Track visitors in real-time.
- **Security Dashboard:** Search and manage active visitors.
- **Admin Analytics:** View charts and reports.
- **Data Export:** Download reports in PDF, Excel, and CSV formats.
- **Email Notifications:** Real email support for password resets.

## Setup Instructions

### Backend
1. Navigate to `backend/` folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file with your credentials (see `.env.example`).
4. Run the server:
   ```bash
   python api_server.py
   ```

### Frontend
1. Navigate to `frontend/` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Credentials
- **Admin:** admin@rachana.org / admin123
- **Security:** guard1@rachana.org / password123

## Tech Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Flask, SQLite
- Libraries: Pandas, ReportLab, OpenPyXL

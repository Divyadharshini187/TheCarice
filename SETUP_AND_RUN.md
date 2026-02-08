# The Carice - Setup & Run Guide

## Quick Start

### On Windows (PowerShell)
```powershell
# Right-click and select "Run with PowerShell", or:
.\START_APPLICATION.ps1
```

### On Windows (Command Prompt)
```cmd
START_APPLICATION.bat
```

---

## Prerequisites

1. **Python 3.8+** installed
2. **Node.js** (for frontend development)
3. **pip** and **npm** package managers

---

## First-Time Setup

### 1. Install Python Dependencies

```bash
# Activate virtual environment (if not already activated)
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac

# Install required packages
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies (Optional - for development)

```bash
cd frontend
npm install
cd ..
```

### 3. Verify Environment Variables

The `.env.local` file in the `backend/` directory should contain:
```
LIVEKIT_URL=wss://your-livekit-server
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
GOOGLE_API_KEY=your-google-key
```

---

## Running the Application

### Using the Startup Script (Recommended)

**PowerShell:**
```powershell
.\START_APPLICATION.ps1
```

**Command Prompt:**
```cmd
START_APPLICATION.bat
```

### Manual Startup

```bash
# Activate virtual environment
.venv\Scripts\activate

# Navigate to backend directory
cd backend

# Run the Flask server
python server.py

# The application will be available at http://localhost:5000
```

---

## Application Architecture

- **Backend**: Flask server running on `http://localhost:5000`
  - REST API at `/api/*`
  - Serves static frontend files
  - LiveKit integration for real-time communication

- **Frontend**: React + Vite application
  - Built to `frontend/dist/`
  - Served as static files from Flask
  - Components in `frontend/src/components/`
  - Pages in `frontend/src/pages/`

- **Database**: SQLite (`backend/foodcourt_db.sqlite`)
  - Stores food orders
  - Customer information
  - Order history

---

## API Endpoints

### Health Check
```
GET /api/health
Response: { "status": "healthy", "service": "food-court-api" }
```

### Get LiveKit Token
```
GET /api/get-token?room=food-court-room&participant=customer-xxxx
Response: { "token": "...", "url": "..." }
```

### Create Order
```
POST /api/orders
Body: {
  "customer_name": "John",
  "items": [
    { "item": "Pizza", "quantity": 2 },
    { "item": "Coke", "quantity": 1 }
  ]
}
Response: {
  "message": "Order created successfully",
  "bill_id": "FC-20260206-xxxxx",
  "total_amount": 450,
  "timestamp": "2026-02-06T10:30:00"
}
```

### Get Order
```
GET /api/orders/{bill_id}
Response: { order details }
```

---

## Troubleshooting

### Issue: "Virtual environment not found"
**Solution:** Create a virtual environment
```bash
python -m venv .venv
```

### Issue: "ModuleNotFoundError: No module named 'flask'"
**Solution:** Install dependencies
```bash
.venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: "Port 5000 already in use"
**Solution:** Kill the process using port 5000
```bash
# PowerShell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force

# Command Prompt
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "LIVEKIT_API_KEY not found"
**Solution:** Ensure `.env.local` file exists in the `backend/` directory with valid credentials

---

## Development

### Rebuild Frontend (After Changes)
```bash
cd frontend
npm run build
cd ..
```

### Watch Frontend (Live Reload)
```bash
cd frontend
npm run dev
# Frontend will be at http://localhost:5173
# Configure proxy in vite.config.js to point to backend at :5000
```

### Run Backend in Debug Mode
The Flask server runs in debug mode automatically, so changes will auto-reload.

---

## Project Structure

```
├── backend/
│   ├── server.py          # Main Flask application
│   ├── api.py             # LiveKit agent functions
│   ├── db_driver.py       # Database operations
│   ├── .env.local         # Environment variables
│   ├── foodcourt_db.sqlite # SQLite database
│   └── KMS/               # Key Management System logs
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── App.jsx        # Main app component
│   ├── dist/              # Built frontend (served by Flask)
│   └── package.json       # Frontend dependencies
├── requirements.txt       # Python dependencies
└── START_APPLICATION.*    # Startup scripts
```

---

## Notes

- The Flask server is in **development mode** by default
- For production, use a proper WSGI server (`gunicorn`, etc.)
- Keep `.env.local` secure and never commit credentials to git
- Database path is relative to backend directory: `backend/foodcourt_db.sqlite`

---

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify all dependencies are installed
3. Ensure environment variables are set in `.env.local`
4. Check that ports 5000 (and 5173 for dev) are available
5. Review logs in the KMS folder for detailed error traces

# HFRAT Backend - Getting Started

## Purpose

The **Health Facility Resource Allocation Tool (HFRAT) Backend** is a Django REST API that manages healthcare facility resources, user authentication, and reporting. It supports three user roles:

- **Admin**: Create users, manage facilities, view all data
- **Monitor**: View dashboard with all facility reports
- **Reporter**: Submit resource reports for their assigned facility

The backend provides JWT-based authentication and exposes RESTful endpoints for frontend integration.

---

## Requirements

- **Python**: 3.11 or higher
- **pip**: Python package manager

---

## Local Setup Instructions

### Step 1: Clone or Extract the Project

```bash
# If from git
git clone https://github.com/your-username/hfrat-backend.git
cd hfrat-backend

# If from zip
unzip hfrat-backend.zip
cd Project_7
```

### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

The required packages are:
- Django 6.0
- Django REST Framework 3.15
- djangorestframework-simplejwt 5.3+
- django-cors-headers 4.4+

### Step 4: Run Database Migrations

```bash
python manage.py migrate
```

This creates the SQLite database (`db.sqlite3`) and sets up all tables.

### Step 5: Create Test Users (Optional)

```bash
python scripts/create_test_users.py
```

This creates three test users:
- **Admin**: username=`admin`, password=`admin123`
- **Monitor**: username=`monitor`, password=`monitor123`
- **Reporter**: username=`reporter`, password=`reporter123`

### Step 6: Start the Development Server

```bash
python manage.py runserver
```

The server will start at: **http://127.0.0.1:8000**

You should see:
```
Django version 6.0, using settings 'hfrat_backend.settings'
Starting development server at http://127.0.0.1:8000/
```

---

## Testing the API

### Quick Health Check

Open your browser or use curl:
```bash
curl http://127.0.0.1:8000/
```

Expected response:
```json
{"status": "HFRAT backend is running ✅"}
```

### Test Authentication

```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Expected response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## CORS Configuration

The backend is configured to accept requests from these origins:

- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5174`

If your frontend runs on a different port, update `hfrat_backend/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:YOUR_PORT",
    "http://127.0.0.1:YOUR_PORT",
]
```

---

## Project Structure

```
hfrat-backend/
├── manage.py                 # Django CLI tool
├── db.sqlite3               # SQLite database (created after migrate)
├── requirements.txt         # Python dependencies
├── backend_contract/        # 📁 THIS FOLDER - API documentation
│   ├── README.md           # Setup guide (you are here)
│   ├── API.md              # Complete API reference
│   ├── models_overview.md  # Database models explained
│   └── sample_responses.json  # Example API responses
├── hfrat_backend/          # Django project configuration
│   ├── settings.py         # Project settings (CORS, JWT, etc.)
│   ├── urls.py             # Main URL routing
│   └── wsgi.py             # WSGI entry point
├── core/                   # Main application
│   ├── models.py           # Database models (User, Facility, ResourceReport)
│   ├── views.py            # API endpoints
│   ├── serializers.py      # JSON serialization
│   ├── urls.py             # API routes
│   ├── permissions.py      # Role-based permissions
│   └── migrations/         # Database schema history
└── scripts/
    └── create_test_users.py  # Test data setup
```

---

## Environment Configuration

The backend uses these default settings for development:

| Setting | Value |
|---------|-------|
| **DEBUG** | `True` |
| **SECRET_KEY** | Default (change for production) |
| **DATABASE** | SQLite (`db.sqlite3`) |
| **JWT Access Token Lifetime** | 5 minutes |
| **JWT Refresh Token Lifetime** | 1 day |

For production, update these in `hfrat_backend/settings.py` or use environment variables.

---

## Common Issues & Solutions

### Issue: `ModuleNotFoundError: No module named 'corsheaders'`
**Solution**: Install dependencies:
```bash
pip install -r requirements.txt
```

### Issue: `django.db.utils.OperationalError: no such table`
**Solution**: Run migrations:
```bash
python manage.py migrate
```

### Issue: `Invalid credentials` when logging in
**Solution**: Create test users:
```bash
python scripts/create_test_users.py
```

### Issue: Port 8000 already in use
**Solution**: Run on different port:
```bash
python manage.py runserver 8001
```

---

## Next Steps

1. ✅ Verify server is running: `http://127.0.0.1:8000/`
2. ✅ Read the API documentation: `backend_contract/API.md`
3. ✅ Review data models: `backend_contract/models_overview.md`
4. ✅ Check example responses: `backend_contract/sample_responses.json`
5. ✅ Test authentication with test users
6. ✅ Build your frontend!

---

## Support

For questions or issues:
- Check the API documentation in `backend_contract/API.md`
- Review Django logs in the terminal where you ran `runserver`
- Contact the backend maintainer

---

## Production Deployment

⚠️ **This is a development server.** For production:

1. Set `DEBUG = False` in settings.py
2. Generate a new `SECRET_KEY`
3. Use a production database (PostgreSQL, MySQL)
4. Use a production WSGI server (Gunicorn, uWSGI)
5. Set up proper HTTPS/SSL
6. Configure proper CORS origins
7. Set up static file serving

See Django deployment documentation: https://docs.djangoproject.com/en/6.0/howto/deployment/

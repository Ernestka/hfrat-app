# HFRAT Backend

A Django REST Framework API for the Health Facility Resource Allocation Tool (HFRAT).

## Features

- JWT-based authentication
- User roles (Admin, Monitor, Reporter)
- Resource tracking and reporting
- Dashboard analytics
- CORS-enabled for frontend integration

## Requirements

- Python 3.11+
- pip

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/YOUR_USERNAME/hfrat-backend.git
   cd hfrat-backend
   ```

2. Create and activate virtual environment
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Mac/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations
   ```bash
   python manage.py migrate
   ```

5. Create test users (optional)
   ```bash
   python scripts/create_test_users.py
   ```

6. Start development server
   ```bash
   python manage.py runserver
   ```

Server will be available at: `http://127.0.0.1:8000`

## API Endpoints

### Authentication
- `POST /api/token/` - Login (get JWT token)
- `POST /api/token/refresh/` - Refresh token

### General
- `GET /api/health/` - Get current user info

### Reporter Endpoints
- `POST /api/reporter/report/` - Submit resource report

### Monitor Endpoints
- `GET /api/monitor/dashboard/` - Get dashboard data

### Admin Endpoints
- `POST /api/admin/users/` - Create new user
- `GET /api/admin/users/list/` - List all users
- `GET /api/admin/facilities/` - List facilities

## Default Test Users

After running `create_test_users.py`:
- **Admin**: username=`admin`, password=`admin123`
- **Monitor**: username=`monitor`, password=`monitor123`
- **Reporter**: username=`reporter`, password=`reporter123`

## Configuration

### CORS Setup

Update `hfrat_backend/settings.py` to add your frontend URL:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://your-frontend-url",
]
```

### Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

## Database

Uses SQLite by default. Database file: `db.sqlite3`

To reset the database:
```bash
rm db.sqlite3
python manage.py migrate
python scripts/create_test_users.py
```

## Project Structure

```
hfrat-backend/
├── core/                    # Main app
│   ├── models.py           # User and Facility models
│   ├── serializers.py      # DRF serializers
│   ├── views.py            # API views
│   ├── urls.py             # API routes
│   └── permissions.py      # Custom permissions
├── hfrat_backend/          # Project settings
│   ├── settings.py         # Django settings
│   ├── urls.py             # Main URL routes
│   └── wsgi.py             # WSGI config
├── scripts/                # Utility scripts
│   └── create_test_users.py
└── manage.py               # Django CLI
```

## Technologies

- **Django** 6.0 - Web framework
- **Django REST Framework** - REST API
- **SimpleJWT** - JWT authentication
- **django-cors-headers** - CORS support
- **SQLite** - Database

## Frontend Integration

This backend is designed to work with any frontend that can make HTTP requests. 

Example setup with React/Vue:
```javascript
const API_URL = 'http://127.0.0.1:8000/api/';

// Login
const response = await fetch(`${API_URL}token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
});
const { access } = await response.json();

// Authenticated request
const data = await fetch(`${API_URL}health/`, {
    headers: { 'Authorization': `Bearer ${access}` }
});
```

## Development

For development, keep `DEBUG = True` in `settings.py`.

For production, set `DEBUG = False` and update `SECRET_KEY`.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

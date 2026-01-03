# HFRAT Deployment Guide - Render

## Prerequisites
- GitHub account
- Render account (free tier available)
- Your code pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Prepare Your Repository

Push your code to GitHub:
```bash
cd "C:\Users\Ernest Katembo\OneDrive\Bureau\Project_7"
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hfrat-app.git
git push -u origin main
```

### 2. Deploy Backend on Render

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: hfrat-backend
   - **Runtime**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn hfrat_backend.wsgi:application`
   - **Plan**: Free

5. Add Environment Variables (click "Advanced"):
   ```
   SECRET_KEY = [click "Generate" button]
   DEBUG = False
   ALLOWED_HOSTS = hfrat-backend.onrender.com
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Render will automatically create a PostgreSQL database
9. Go to your service → "Environment" → Add:
   ```
   DATABASE_URL = [will be auto-filled from database]
   ```

### 3. Deploy Frontend on Render

1. Click "New +" → "Static Site"
2. Select same GitHub repository
3. Configure:
   - **Name**: hfrat-frontend
   - **Root Directory**: hfrat-frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist

4. Add Environment Variable:
   ```
   VITE_API_URL = https://hfrat-backend.onrender.com/api/
   ```

5. Click "Create Static Site"

### 4. Update CORS Settings

After frontend deploys, update backend environment variables:

1. Go to hfrat-backend service
2. Environment → Edit:
   ```
   CORS_ALLOWED_ORIGINS = https://hfrat-frontend.onrender.com
   ```
3. Save (service will auto-redeploy)

### 5. Initialize Database

1. Go to hfrat-backend service
2. Click "Shell" tab
3. Run:
   ```bash
   python manage.py createsuperuser
   # Create admin user when prompted
   ```

### 6. Access Your App

- Frontend: https://hfrat-frontend.onrender.com
- Backend API: https://hfrat-backend.onrender.com/api/
- Admin Panel: https://hfrat-backend.onrender.com/admin/

## Important Notes

### Free Tier Limitations
- Backend spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Database: 90 days retention on free tier

### Upgrade Options
- Starter ($7/month): No spin-down, faster response
- Database ($7/month): Persistent storage

### Environment Variables Needed

**Backend:**
- `SECRET_KEY`: Generate secure key
- `DEBUG`: Set to False
- `ALLOWED_HOSTS`: Your backend URL
- `DATABASE_URL`: Auto-configured
- `CORS_ALLOWED_ORIGINS`: Your frontend URL

**Frontend:**
- `VITE_API_URL`: Your backend API URL

## Troubleshooting

### Backend won't start
- Check "Logs" tab for errors
- Verify `build.sh` has executable permissions
- Ensure all dependencies in requirements.txt

### Frontend can't reach backend
- Check CORS_ALLOWED_ORIGINS includes frontend URL
- Verify VITE_API_URL is correct
- Check browser console for CORS errors

### Database errors
- Ensure migrations ran: Check build logs
- PostgreSQL needs psycopg2-binary in requirements.txt

### Static files not loading
- Verify collectstatic ran in build.sh
- Check STATIC_ROOT settings

## Manual Commands

Access backend shell:
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py shell
```

## Monitoring

- View logs in Render dashboard
- Check service health at /api/health/
- Monitor database usage in database dashboard

## Updates

To deploy updates:
1. Push to GitHub main branch
2. Render auto-deploys on push
3. Or click "Manual Deploy" in dashboard

## Alternative: Using render.yaml

The included `render.yaml` allows infrastructure-as-code deployment:
1. Push to GitHub
2. Go to Render Dashboard
3. New → Blueprint
4. Connect repository
5. Render creates all services automatically

---

Your HFRAT application is now live! 🎉

# Admin Settings Module Documentation

## Overview
The Admin Settings module provides authorized administrators with the ability to configure system-wide parameters, especially critical threshold values used for alerts and dashboard status calculations.

## Features

### 1. **Dynamic Threshold Configuration**
Administrators can configure critical thresholds for:
- ICU Beds Available
- Ventilators Available  
- Staff on Duty

These thresholds determine when a facility is marked as "CRITICAL" on the dashboard.

### 2. **Setting Types**
- **THRESHOLD**: Numeric values for critical resource levels
- **ALERT**: Boolean or configuration values for notification systems
- **GENERAL**: General system configuration parameters

### 3. **CRUD Operations**
- **Create**: Add new custom settings
- **Read**: View all settings with filtering by type
- **Update**: Modify setting values and descriptions
- **Delete**: Remove settings (with confirmation)

### 4. **Default Initialization**
One-click initialization of default system settings with protection against duplicates.

## Database Model

### SystemSetting
```python
class SystemSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    setting_type = models.CharField(max_length=20, choices=[...])
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, ...)
```

**Fields:**
- `key`: Unique identifier for the setting (e.g., "critical_icu_beds_threshold")
- `value`: The setting value (stored as string, converted as needed)
- `description`: Human-readable explanation of what the setting controls
- `setting_type`: One of THRESHOLD, ALERT, or GENERAL
- `last_updated`: Automatic timestamp of last modification
- `updated_by`: User who last modified the setting

## API Endpoints

### 1. List/Create Settings
**Endpoint:** `GET/POST /api/admin/settings/`
**Permission:** Admin Only
**Methods:**
- `GET`: Returns all settings
- `POST`: Create a new setting

**Response Example (GET):**
```json
[
  {
    "id": 1,
    "key": "critical_icu_beds_threshold",
    "value": "5",
    "description": "Minimum ICU beds before facility is marked CRITICAL",
    "setting_type": "THRESHOLD",
    "last_updated": "2026-01-03T10:40:00Z",
    "updated_by": 2,
    "updated_by_username": "admin"
  }
]
```

### 2. Retrieve/Update/Delete Setting
**Endpoint:** `GET/PUT/DELETE /api/admin/settings/<setting_id>/`
**Permission:** Admin Only
**Methods:**
- `GET`: Retrieve specific setting
- `PUT`: Update value and/or description
- `DELETE`: Remove setting

**Update Request Example:**
```json
{
  "value": "10",
  "description": "Updated threshold value"
}
```

### 3. Initialize Default Settings
**Endpoint:** `POST /api/admin/settings/initialize/`
**Permission:** Admin Only
**Description:** Creates default system settings if they don't exist

**Response Example:**
```json
{
  "message": "Settings initialization complete",
  "created": 5,
  "existing": 0,
  "total": 5
}
```

### 4. Get Public Thresholds
**Endpoint:** `GET /api/settings/public/`
**Permission:** Authenticated Users
**Description:** Returns threshold settings for dashboard display

**Response Example:**
```json
{
  "critical_icu_beds_threshold": 5,
  "critical_ventilators_threshold": 3,
  "critical_staff_threshold": 10
}
```

## Default Settings

The system initializes with these default settings:

| Key | Value | Type | Description |
|-----|-------|------|-------------|
| critical_icu_beds_threshold | 5 | THRESHOLD | Minimum ICU beds before CRITICAL status |
| critical_ventilators_threshold | 3 | THRESHOLD | Minimum ventilators before CRITICAL status |
| critical_staff_threshold | 10 | THRESHOLD | Minimum staff before CRITICAL status |
| alert_notification_enabled | true | ALERT | Enable/disable alert notifications |
| dashboard_refresh_interval | 60 | GENERAL | Dashboard auto-refresh interval (seconds) |

## Frontend Integration

### Admin Settings Page
**Route:** `/settings` (Admin role only)

**Features:**
1. **Filter Tabs**: ALL, THRESHOLD, ALERT, GENERAL
2. **Initialize Button**: Create default settings
3. **Create Button**: Add custom settings
4. **Settings Table**: Display with edit/delete actions
5. **Modals**: Create and Edit forms

**UI Components:**
- Color-coded setting type badges
- Inline edit/delete buttons
- Real-time updates after modifications
- Confirmation dialogs for destructive actions

### API Integration
```javascript
// Import from services/api.js
import {
  adminGetSettings,
  adminCreateSetting,
  adminUpdateSetting,
  adminDeleteSetting,
  adminInitializeSettings
} from '../services/api'

// Usage examples
const settings = await adminGetSettings()
await adminCreateSetting({ key: 'new_setting', value: '100', ... })
await adminUpdateSetting(settingId, { value: '200' })
await adminDeleteSetting(settingId)
await adminInitializeSettings()
```

## Dynamic Dashboard Status Calculation

The dashboard now uses dynamic thresholds from settings:

**Before:**
```python
def get_status(self, obj):
    return "CRITICAL" if obj.icu_beds_available == 0 else "OK"
```

**After:**
```python
def get_status(self, obj):
    threshold_setting = SystemSetting.objects.filter(
        key='critical_icu_beds_threshold'
    ).first()
    threshold = int(threshold_setting.value) if threshold_setting else 5
    return "CRITICAL" if obj.icu_beds_available <= threshold else "OK"
```

This allows administrators to adjust the definition of "CRITICAL" without code changes.

## Security Considerations

1. **Admin-Only Access**: All write operations require Admin role
2. **Validation**: Values cannot be empty strings
3. **Audit Trail**: `updated_by` tracks who made changes
4. **Unique Keys**: Prevents duplicate settings
5. **Type Safety**: Frontend enforces appropriate input types

## Testing Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`
- Role: ADMIN

## Usage Workflow

### 1. Access Settings
1. Login as admin user
2. Navigate to "Settings" in navigation bar
3. View existing settings

### 2. Modify Thresholds
1. Click "Edit" on desired setting
2. Update value (e.g., change ICU threshold from 5 to 10)
3. Optionally update description
4. Click "Update"
5. Dashboard immediately uses new threshold

### 3. Create Custom Setting
1. Click "+ New Setting"
2. Enter unique key (e.g., `max_report_age_days`)
3. Enter value (e.g., `7`)
4. Select type (GENERAL)
5. Add description
6. Click "Create"

### 4. Initialize Defaults
1. Click "Initialize Defaults" button
2. Confirm action
3. System creates missing default settings
4. Shows count of created vs existing

## Future Enhancements

Potential improvements:
1. **Validation Rules**: Add min/max ranges for numeric thresholds
2. **Setting Groups**: Organize related settings
3. **Change History**: Track all modifications with timestamps
4. **Import/Export**: Backup and restore settings
5. **Setting Templates**: Predefined configurations for different scenarios
6. **Real-time Sync**: WebSocket updates when settings change
7. **Role-based Visibility**: Some settings visible to monitors
8. **Computed Settings**: Settings derived from other settings

## API Summary

| Endpoint | Method | Permission | Purpose |
|----------|--------|------------|---------|
| `/api/admin/settings/` | GET | Admin | List all settings |
| `/api/admin/settings/` | POST | Admin | Create setting |
| `/api/admin/settings/<id>/` | GET | Admin | Get one setting |
| `/api/admin/settings/<id>/` | PUT | Admin | Update setting |
| `/api/admin/settings/<id>/` | DELETE | Admin | Delete setting |
| `/api/admin/settings/initialize/` | POST | Admin | Initialize defaults |
| `/api/settings/public/` | GET | Authenticated | Get thresholds |

## Migration Applied

**Migration File:** `core/migrations/0005_systemsetting.py`
**Status:** ✅ Applied
**Tables Created:** `core_systemsetting`

## Error Handling

The module includes comprehensive error handling:
- Invalid setting IDs return 404
- Empty values rejected with validation error
- Duplicate keys prevented by unique constraint
- Failed operations show user-friendly error messages
- Backend validation prevents data corruption

## Conclusion

The Admin Settings module provides a powerful, user-friendly interface for system configuration. It enables non-technical administrators to adjust critical parameters without code deployment, improving operational flexibility and response times.

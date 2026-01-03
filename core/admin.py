from django.contrib import admin
from .models import User, Facility, ResourceReport, ResourceReportHistory, SystemSetting

admin.site.register(User)
admin.site.register(Facility)
admin.site.register(ResourceReport)
admin.site.register(ResourceReportHistory)
admin.site.register(SystemSetting)

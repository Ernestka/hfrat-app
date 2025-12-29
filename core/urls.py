from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health_check, name="health_check"),
    path("reporter/report/", views.ReporterResourceReportView.as_view(),
         name="reporter_resource_report"),
    path("monitor/dashboard/", views.MonitorDashboardView.as_view(),
         name="monitor_dashboard"),
    path("admin/users/", views.AdminCreateUserView.as_view(),
         name="admin_create_user"),
    path("admin/users/list/", views.AdminUserListView.as_view(),
         name="admin_list_users"),
    path("admin/facilities/", views.AdminFacilityView.as_view(),
         name="admin_facilities"),
]

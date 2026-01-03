from rest_framework.permissions import BasePermission


class ReporterOnly(BasePermission):
    message = "Only REPORTER users may access this endpoint."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "REPORTER")


class MonitorOnly(BasePermission):
    message = "Only MONITOR users may access this endpoint."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "MONITOR")


class MonitorOrAdmin(BasePermission):
    """Allow both MONITOR and ADMIN users to access this endpoint."""
    message = "Only MONITOR or ADMIN users may access this endpoint."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (
                getattr(user, "role", None) == "MONITOR"
                or getattr(user, "role", None) == "ADMIN"
                or getattr(user, "is_staff", False)
                or getattr(user, "is_superuser", False)
            )
        )


class AdminOnly(BasePermission):
    message = "Only admin users may access this endpoint."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (
                getattr(user, "role", None) == "ADMIN"
                or getattr(user, "is_staff", False)
                or getattr(user, "is_superuser", False)
            )
        )

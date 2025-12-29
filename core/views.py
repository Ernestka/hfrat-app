from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import ResourceReport, User, Facility
from .serializers import (
    ResourceReportSerializer,
    DashboardFacilityReportSerializer,
    AdminCreateUserSerializer,
    FacilitySerializer,
    AdminUserListSerializer,
)
from .permissions import ReporterOnly, MonitorOnly, AdminOnly


@api_view(["GET"])
def health_check(request):
    # Include role hint for frontend routing
    role = None
    user = request.user if getattr(
        request, "user", None) and request.user.is_authenticated else None
    if user:
        if getattr(user, "role", None) == User.Role.ADMINISTRATOR:
            role = "ADMIN"
        elif user.is_staff or user.is_superuser:
            role = "ADMIN"
        else:
            role = getattr(user, "role", None)
    return Response({"status": "ok", "role": role})


class ReporterResourceReportView(APIView):
    permission_classes = [IsAuthenticated, ReporterOnly]

    def _upsert(self, request):
        user = request.user
        if not getattr(user, "facility", None):
            return Response({"detail": "Assigned facility required for reporters."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ResourceReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        report, _ = ResourceReport.objects.update_or_create(
            facility=user.facility,
            defaults=serializer.validated_data,
        )
        return Response(ResourceReportSerializer(report).data, status=status.HTTP_200_OK)

    def post(self, request):
        return self._upsert(request)

    def put(self, request):
        return self._upsert(request)


class MonitorDashboardView(APIView):
    permission_classes = [IsAuthenticated, MonitorOnly]

    def get(self, request):
        queryset = ResourceReport.objects.select_related("facility").all()
        serializer = DashboardFacilityReportSerializer(queryset, many=True)
        return Response(serializer.data)


class AdminCreateUserView(APIView):
    permission_classes = [IsAuthenticated, AdminOnly]

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(serializer.to_representation(user), status=status.HTTP_201_CREATED)


class AdminFacilityView(APIView):
    permission_classes = [IsAuthenticated, AdminOnly]

    def get(self, request):
        facilities = Facility.objects.all().order_by("facility_name")
        data = FacilitySerializer(facilities, many=True).data
        return Response(data)

    def post(self, request):
        serializer = FacilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, AdminOnly]

    def get(self, request):
        users = User.objects.select_related("facility").order_by("username")
        data = AdminUserListSerializer(users, many=True).data
        return Response(data)

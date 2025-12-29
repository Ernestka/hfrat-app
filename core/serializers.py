from rest_framework import serializers

from .models import ResourceReport, User, Facility


class ResourceReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceReport
        fields = (
            "icu_beds_available",
            "ventilators_available",
            "staff_on_duty",
            "last_updated",
        )
        read_only_fields = ("last_updated",)

    def validate_icu_beds_available(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Must be a non-negative integer.")
        return value


class DashboardFacilityReportSerializer(serializers.ModelSerializer):
    facility_name = serializers.CharField(
        source="facility.facility_name", read_only=True)
    status = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ResourceReport
        fields = (
            "facility_name",
            "icu_beds_available",
            "ventilators_available",
            "staff_on_duty",
            "last_updated",
            "status",
        )
        read_only_fields = fields

    def get_status(self, obj):
        return "CRITICAL" if obj.icu_beds_available == 0 else "OK"

    def validate_ventilators_available(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Must be a non-negative integer.")
        return value

    def validate_staff_on_duty(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Must be a non-negative integer.")
        return value


class AdminCreateUserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(
        choices=[User.Role.REPORTER, User.Role.MONITOR, User.Role.ADMINISTRATOR])
    facility_id = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, attrs):
        role = attrs.get("role")
        facility_id = attrs.get("facility_id")

        if role == User.Role.REPORTER:
            if facility_id is None:
                raise serializers.ValidationError(
                    {"facility_id": "Reporters must be assigned to a facility."})
            # Ensure facility exists
            try:
                Facility.objects.get(id=facility_id)
            except Facility.DoesNotExist:
                raise serializers.ValidationError(
                    {"facility_id": "Facility not found."})
        else:
            # MONITOR and ADMIN must not have facility
            if facility_id is not None:
                raise serializers.ValidationError(
                    {"facility_id": "This role must not be assigned to a facility."})

        return attrs

    def create(self, validated_data):
        username = validated_data["username"]
        password = validated_data["password"]
        role = validated_data["role"]
        facility_id = validated_data.get("facility_id")

        facility = None
        if role == User.Role.REPORTER and facility_id is not None:
            facility = Facility.objects.get(id=facility_id)

        user = User.objects.create_user(
            username=username,
            password=password,
            role=role,
            facility=facility,
        )
        return user

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "username": instance.username,
            "role": instance.role,
            "facility": instance.facility.id if instance.facility else None,
        }


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = (
            "id",
            "facility_name",
            "country",
            "city_or_state",
            "location_detail",
        )


class AdminUserListSerializer(serializers.ModelSerializer):
    facility = FacilitySerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "role", "facility"]
        read_only_fields = fields

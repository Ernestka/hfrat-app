from rest_framework import serializers

from .models import ResourceReport, User, Facility, SystemSetting


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
    facility_id = serializers.IntegerField(
        source="facility.id", read_only=True)
    facility_name = serializers.CharField(
        source="facility.name", read_only=True)
    country = serializers.CharField(source="facility.country", read_only=True)
    city = serializers.CharField(source="facility.city", read_only=True)
    status = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ResourceReport
        fields = (
            "facility_id",
            "facility_name",
            "country",
            "city",
            "icu_beds_available",
            "ventilators_available",
            "staff_on_duty",
            "last_updated",
            "status",
        )
        read_only_fields = fields

    def get_status(self, obj):
        """Determine facility status based on configurable thresholds"""
        from .models import SystemSetting

        try:
            # Get threshold from settings, default to 0 if not found
            threshold_setting = SystemSetting.objects.filter(
                key='critical_icu_beds_threshold'
            ).first()
            threshold = int(
                threshold_setting.value) if threshold_setting else 5
        except (ValueError, AttributeError):
            threshold = 5

        return "CRITICAL" if obj.icu_beds_available <= threshold else "OK"

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
    role = serializers.CharField()
    hospital_name = serializers.CharField(max_length=255, required=False)
    country = serializers.CharField(max_length=120, required=False)
    city = serializers.CharField(max_length=120, required=False)

    def validate_role(self, value):
        normalized = value.upper()
        valid = {User.Role.REPORTER,
                 User.Role.MONITOR, User.Role.ADMINISTRATOR}
        if normalized not in valid:
            raise serializers.ValidationError(
                "Role must be one of: ADMIN, MONITOR, REPORTER.")
        return normalized

    def validate(self, attrs):
        role = attrs.get("role")
        hospital_name = attrs.get("hospital_name")
        country = attrs.get("country")
        city = attrs.get("city")

        if role == User.Role.REPORTER:
            missing = [field for field, val in {
                "hospital_name": hospital_name,
                "country": country,
                "city": city,
            }.items() if not val]
            if missing:
                raise serializers.ValidationError({
                    field: "This field is required for reporters." for field in missing
                })
        else:
            # MONITOR and ADMIN must not send facility details
            if any([hospital_name, country, city]):
                raise serializers.ValidationError({
                    "facility": "Facility details are only allowed when role is REPORTER."
                })
        return attrs

    def create(self, validated_data):
        username = validated_data["username"]
        password = validated_data["password"]
        role = validated_data["role"]

        facility = None
        if role == User.Role.REPORTER:
            facility, _ = Facility.objects.get_or_create(
                name=validated_data["hospital_name"],
                country=validated_data["country"],
                city=validated_data["city"],
            )

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
            "facility": FacilitySerializer(instance.facility).data if instance.facility else None,
        }


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = (
            "id",
            "name",
            "country",
            "city",
        )


class AdminUserListSerializer(serializers.ModelSerializer):
    facility = FacilitySerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "role", "facility"]
        read_only_fields = fields


class AdminUpdateUserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=False)
    role = serializers.CharField(required=False)
    hospital_name = serializers.CharField(max_length=255, required=False)
    country = serializers.CharField(max_length=120, required=False)
    city = serializers.CharField(max_length=120, required=False)
    password = serializers.CharField(
        write_only=True, min_length=6, required=False)

    def validate_role(self, value):
        if value:
            normalized = value.upper()
            valid = {User.Role.REPORTER,
                     User.Role.MONITOR, User.Role.ADMINISTRATOR}
            if normalized not in valid:
                raise serializers.ValidationError(
                    "Role must be one of: ADMIN, MONITOR, REPORTER.")
            return normalized
        return value

    def update(self, instance, validated_data):
        username = validated_data.get('username')
        role = validated_data.get('role')
        password = validated_data.get('password')
        hospital_name = validated_data.get('hospital_name')
        country = validated_data.get('country')
        city = validated_data.get('city')

        if username:
            instance.username = username

        if role:
            instance.role = role

            if role == User.Role.REPORTER:
                if all([hospital_name, country, city]):
                    facility, _ = Facility.objects.get_or_create(
                        name=hospital_name,
                        country=country,
                        city=city,
                    )
                    instance.facility = facility
                elif not instance.facility:
                    raise serializers.ValidationError({
                        "facility": "Reporters must be assigned to a facility."
                    })
            else:
                instance.facility = None

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class SystemSettingSerializer(serializers.ModelSerializer):
    updated_by_username = serializers.CharField(
        source="updated_by.username", read_only=True, allow_null=True)

    class Meta:
        model = SystemSetting
        fields = (
            "id",
            "key",
            "value",
            "description",
            "setting_type",
            "last_updated",
            "updated_by",
            "updated_by_username",
        )
        read_only_fields = ("id", "last_updated",
                            "updated_by", "updated_by_username")

    def validate_value(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Value cannot be empty.")
        return value


class SystemSettingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ("value", "description")

    def validate_value(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Value cannot be empty.")
        return value

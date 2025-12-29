from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser


class Facility(models.Model):
    facility_name = models.CharField(max_length=255)
    country = models.CharField(max_length=120, default="Unknown")
    city_or_state = models.CharField(max_length=120, default="Unknown")
    location_detail = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.facility_name


class User(AbstractUser):
    class Role(models.TextChoices):
        REPORTER = "REPORTER", _("Reporter")
        MONITOR = "MONITOR", _("Monitor")
        ADMINISTRATOR = "ADMIN", _("Administrator")

    role = models.CharField(max_length=20, choices=Role.choices)
    facility = models.ForeignKey(
        Facility,
        on_delete=models.PROTECT,
        related_name="users",
        blank=True,
        null=True,
    )

    def clean(self):
        super().clean()
        if self.role == self.Role.REPORTER and self.facility is None:
            raise ValidationError(
                {"facility": _("Reporters must be assigned to a facility.")})
        if self.role in (self.Role.MONITOR, self.Role.ADMINISTRATOR) and self.facility is not None:
            raise ValidationError(
                {"facility": _("This role must not be assigned to a facility.")})

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(role="REPORTER", facility__isnull=False)
                    | models.Q(role="MONITOR", facility__isnull=True)
                    | models.Q(role="ADMIN", facility__isnull=True)
                ),
                name="user_facility_role_requirement",
            )
        ]

    def __str__(self):
        return self.username


class ResourceReport(models.Model):
    facility = models.OneToOneField(
        Facility,
        on_delete=models.CASCADE,
        related_name="resource_report",
    )
    icu_beds_available = models.PositiveIntegerField()
    ventilators_available = models.PositiveIntegerField()
    staff_on_duty = models.PositiveIntegerField()
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Resource report for {self.facility.facility_name}"

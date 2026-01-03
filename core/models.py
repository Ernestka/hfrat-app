from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser


class Facility(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=120)
    city = models.CharField(max_length=120)

    class Meta:
        unique_together = ("name", "country", "city")

    def __str__(self):
        return self.name


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
        return f"Resource report for {self.facility.name}"


class ResourceReportHistory(models.Model):
    """Historical snapshots of resource reports for trend analysis"""
    facility = models.ForeignKey(
        Facility,
        on_delete=models.CASCADE,
        related_name="report_history",
    )
    icu_beds_available = models.PositiveIntegerField()
    ventilators_available = models.PositiveIntegerField()
    staff_on_duty = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name_plural = "Resource report histories"

    def __str__(self):
        return f"{self.facility.name} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


class SystemSetting(models.Model):
    """System-wide configuration settings for thresholds and parameters"""
    key = models.CharField(max_length=100, unique=True,
                           help_text="Setting identifier")
    value = models.CharField(max_length=500, help_text="Setting value")
    description = models.TextField(
        blank=True, help_text="Description of what this setting controls")
    setting_type = models.CharField(
        max_length=20,
        choices=[
            ('THRESHOLD', 'Threshold'),
            ('GENERAL', 'General'),
            ('ALERT', 'Alert'),
        ],
        default='GENERAL'
    )
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="settings_updated"
    )

    class Meta:
        ordering = ['setting_type', 'key']
        verbose_name_plural = "System settings"

    def __str__(self):
        return f"{self.key} = {self.value}"

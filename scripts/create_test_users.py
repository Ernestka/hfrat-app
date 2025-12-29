from core.models import Facility, User
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hfrat_backend.settings')

django.setup()


f, _ = Facility.objects.get_or_create(name='Central Hospital')

r, _ = User.objects.get_or_create(username='reporter')
r.role = 'REPORTER'
r.facility = f
r.set_password('reporter123')
r.is_active = True
r.save()

m, _ = User.objects.get_or_create(username='monitor')
m.role = 'MONITOR'
m.facility = None
m.set_password('monitor123')
m.is_active = True
m.save()

print('Created/updated users: reporter / monitor')

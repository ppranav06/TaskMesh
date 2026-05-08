# tests/factories.py
import factory
from app.models import User, Organisation, OrgMember, Task

class UserFactory(factory.Factory):
    class Meta:
        model = User
    email = factory.Sequence(lambda n: f"user{n}@test.com")
    name = factory.Faker("name")
    password_hash = "$2b$12$..."  # bcrypt hash of "testpass"

class OrgFactory(factory.Factory):
    class Meta:
        model = Organisation
    name = factory.Sequence(lambda n: f"Org {n}")

# from app.api.v1.core.models import Company
# from app.db_setup import get_db
# from sqlalchemy import select

# db = next(get_db())  # We get a session from the database

# company = Company(
#     name="Acme Corp",
#     postal_code="12345",
#     email="contact@acme.com",
#     description="A great company",
#     analytics_module=True,
# )
# db.add(company)  # Stage the change
# db.commit()  # Commit the unit of work

# Change a company
# company_2 = Company(
#     name="Acme Corp",
#     postal_code="12345",
#     email="contact@acme.com",
#     description="A great company",
#     analytics_module=True,
# )

# company_2.name = "Acme Corp 3"

# db.add(company_2)  # Stage the change
# db.commit()  # Commit the unit of work

# print(company_2.name)

# Update

# company = db.get_one(Company, 1)
# if company:
#     company.name = "Updated Corp123123123213"
#     company.email = "new@email.com12312321321321312"
#     db.commit()

# company = db.scalars(select(Company).where(Company.id == 1)).first()
# if company:
#     print("in here")
#     company.name = "12312321Updated Corp123123213125"
#     company.email = "123123new@email.com3123213213212"
#     db.commit()

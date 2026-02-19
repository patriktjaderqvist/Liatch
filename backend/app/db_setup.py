from app.api.v1.core.models import Base
from app.settings import settings
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Connection, Engine
from sqlalchemy.orm import Session

# echo = True to see the SQL queries
engine = create_engine(f"{settings.DB_URL}", echo=True)


def _apply_sqlite_bootstrap_migrations(db_engine: Engine) -> None:
    """
    Keeps old local SQLite files compatible when models gain new columns.
    SQLite does not support ALTER TABLE ... ADD COLUMN IF NOT EXISTS, so we
    inspect first and then run only the missing ALTER statements.
    """
    if db_engine.dialect.name != "sqlite":
        return

    inspector = inspect(db_engine)
    table_names = set(inspector.get_table_names())

    with db_engine.begin() as connection:
        if "companies" in table_names:
            _migrate_legacy_companies_table(connection, inspector)
        if "students" in table_names:
            _migrate_students_school_id_nullable(connection)


def _migrate_legacy_companies_table(connection: Connection, inspector) -> None:
    existing_columns = {column["name"] for column in inspector.get_columns("companies")}
    alter_statements: list[str] = []

    if "organization_number" not in existing_columns:
        alter_statements.append(
            "ALTER TABLE companies ADD COLUMN organization_number VARCHAR(50)"
        )
    if "city" not in existing_columns:
        alter_statements.append("ALTER TABLE companies ADD COLUMN city VARCHAR(120)")
    if "created_at" not in existing_columns:
        alter_statements.append(
            "ALTER TABLE companies ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
        )
    if "updated_at" not in existing_columns:
        alter_statements.append(
            "ALTER TABLE companies ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
        )

    for statement in alter_statements:
        connection.execute(text(statement))

    _create_sqlite_unique_indexes_if_possible(connection)


def _migrate_students_school_id_nullable(connection: Connection) -> None:
    if not _sqlite_column_exists(connection, "students", "school_id"):
        return
    if not _sqlite_column_is_not_null(connection, "students", "school_id"):
        return

    connection.execute(text("PRAGMA foreign_keys=OFF"))
    try:
        connection.execute(
            text(
                """
                CREATE TABLE students__new (
                    first_name VARCHAR(120) NOT NULL,
                    last_name VARCHAR(120) NOT NULL,
                    personal_number VARCHAR(20),
                    program VARCHAR(150),
                    school_id INTEGER,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    UNIQUE (personal_number),
                    FOREIGN KEY(school_id) REFERENCES schools (id) ON DELETE SET NULL
                )
                """
            )
        )
        connection.execute(
            text(
                """
                INSERT INTO students__new (
                    first_name,
                    last_name,
                    personal_number,
                    program,
                    school_id,
                    created_at,
                    updated_at,
                    id
                )
                SELECT
                    first_name,
                    last_name,
                    personal_number,
                    program,
                    school_id,
                    created_at,
                    updated_at,
                    id
                FROM students
                """
            )
        )
        connection.execute(text("DROP TABLE students"))
        connection.execute(text("ALTER TABLE students__new RENAME TO students"))
        connection.execute(text("CREATE INDEX ix_students_school_id ON students (school_id)"))
    finally:
        connection.execute(text("PRAGMA foreign_keys=ON"))


def _create_sqlite_unique_indexes_if_possible(connection: Connection) -> None:
    """
    Creates unique indexes for columns that became unique in the model.
    If legacy data has duplicates, we skip the index instead of failing startup.
    """
    unique_index_specs = (
        ("uq_companies_organization_number", "organization_number"),
        ("uq_companies_email", "email"),
    )

    for index_name, column in unique_index_specs:
        if _sqlite_index_exists(connection, index_name):
            continue
        if _sqlite_has_duplicate_non_null_values(connection, "companies", column):
            continue
        connection.execute(
            text(f"CREATE UNIQUE INDEX {index_name} ON companies ({column})")
        )


def _sqlite_index_exists(connection: Connection, index_name: str) -> bool:
    row = connection.execute(
        text(
            "SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = :index_name LIMIT 1"
        ),
        {"index_name": index_name},
    ).first()
    return row is not None


def _sqlite_has_duplicate_non_null_values(connection: Connection, table: str, column: str) -> bool:
    allowed_columns = {"companies": {"organization_number", "email"}}
    if table not in allowed_columns or column not in allowed_columns[table]:
        raise ValueError(f"Unsupported table/column check: {table}.{column}")

    duplicate_row = connection.execute(
        text(
            f"""
            SELECT 1
            FROM {table}
            WHERE {column} IS NOT NULL
            GROUP BY {column}
            HAVING COUNT(*) > 1
            LIMIT 1
            """
        )
    ).first()
    return duplicate_row is not None


def _sqlite_column_exists(connection: Connection, table: str, column: str) -> bool:
    rows = connection.execute(text(f"PRAGMA table_info({table})")).fetchall()
    return any(row[1] == column for row in rows)


def _sqlite_column_is_not_null(connection: Connection, table: str, column: str) -> bool:
    rows = connection.execute(text(f"PRAGMA table_info({table})")).fetchall()
    for row in rows:
        if row[1] == column:
            return bool(row[3])
    return False


def init_db():
    Base.metadata.create_all(bind=engine)
    _apply_sqlite_bootstrap_migrations(engine)


def get_db():
    with Session(engine, expire_on_commit=False) as session:
        yield session

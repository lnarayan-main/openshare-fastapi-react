"""merge multiple heads

Revision ID: 9f01bb3b7cd0
Revises: 0db3c02391b4, e1e0367fd784
Create Date: 2026-04-14 17:40:04.486962

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f01bb3b7cd0'
down_revision: Union[str, None] = ('0db3c02391b4', 'e1e0367fd784')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

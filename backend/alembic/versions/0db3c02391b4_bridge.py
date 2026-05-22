"""bridge missing migration
Revision ID: 0db3c02391b4
Revises: None
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0db3c02391b4'
down_revision = None # Or the ID of the file that actually came before it if the folder isn't empty

def upgrade():
    # Leave this empty. It just tells Alembic: 
    # "I am here, and I don't need to change any SQL."
    pass

def downgrade():
    pass
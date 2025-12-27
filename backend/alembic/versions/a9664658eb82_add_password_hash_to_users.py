"""Add password_hash to users

Revision ID: a9664658eb82
Revises: f8acdd5e5aa8
Create Date: 2025-12-27 10:08:25.597408

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a9664658eb82'
down_revision: Union[str, Sequence[str], None] = 'f8acdd5e5aa8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # First add the column as nullable
    op.add_column('users', sa.Column('password_hash', sa.String(), nullable=True))
    
    # Set a default placeholder for existing users (they will need to reset password)
    op.execute("UPDATE users SET password_hash = 'NEEDS_RESET' WHERE password_hash IS NULL")
    
    # Now make it NOT NULL
    op.alter_column('users', 'password_hash', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'password_hash')

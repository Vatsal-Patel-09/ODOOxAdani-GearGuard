"""Add missing fields and new tables

Revision ID: 3b5c9a8f2e1d
Revises: 2adc9396e1de
Create Date: 2025-12-27 09:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3b5c9a8f2e1d'
down_revision: Union[str, Sequence[str], None] = '2adc9396e1de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing fields to existing tables and create new tables."""
    
    # === Users Table Updates ===
    op.add_column('users', sa.Column('phone', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('department', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('job_title', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('is_technician', sa.Boolean(), nullable=True, default=False))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=True, default=True))
    op.add_column('users', sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True))
    
    # Set defaults for existing rows
    op.execute("UPDATE users SET is_technician = FALSE WHERE is_technician IS NULL")
    op.execute("UPDATE users SET is_active = TRUE WHERE is_active IS NULL")
    
    # Create indexes
    op.create_index('idx_users_name', 'users', ['name'])
    op.create_index('idx_users_is_technician', 'users', ['is_technician'])
    
    # === Maintenance Teams Table Updates ===
    op.add_column('maintenance_teams', sa.Column('team_lead_id', sa.UUID(), nullable=True))
    op.add_column('maintenance_teams', sa.Column('color', sa.String(20), nullable=True, server_default='#3498db'))
    op.add_column('maintenance_teams', sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True))
    
    op.create_foreign_key(
        'fk_maintenance_teams_team_lead',
        'maintenance_teams', 'users',
        ['team_lead_id'], ['id'],
        ondelete='SET NULL'
    )
    
    # === Equipment Table Updates ===
    op.add_column('equipment', sa.Column('default_technician_id', sa.UUID(), nullable=True))
    op.add_column('equipment', sa.Column('purchase_cost', sa.Numeric(15, 2), nullable=True))
    op.add_column('equipment', sa.Column('warranty_info', sa.Text(), nullable=True))
    op.add_column('equipment', sa.Column('health_percentage', sa.Integer(), nullable=True, server_default='100'))
    op.add_column('equipment', sa.Column('status', sa.String(50), nullable=True, server_default='active'))
    op.add_column('equipment', sa.Column('notes', sa.Text(), nullable=True))
    op.add_column('equipment', sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True))
    
    # Set defaults for existing rows
    op.execute("UPDATE equipment SET health_percentage = 100 WHERE health_percentage IS NULL")
    op.execute("UPDATE equipment SET status = 'active' WHERE status IS NULL")
    op.execute("UPDATE equipment SET status = 'scrapped' WHERE is_scrapped = TRUE")
    
    # Drop old is_scrapped column (replaced by status)
    op.drop_column('equipment', 'is_scrapped')
    
    # Create foreign key for default_technician
    op.create_foreign_key(
        'fk_equipment_default_technician',
        'equipment', 'users',
        ['default_technician_id'], ['id'],
        ondelete='SET NULL'
    )
    
    # Create indexes
    op.create_index('idx_equipment_name', 'equipment', ['name'])
    op.create_index('idx_equipment_category', 'equipment', ['category'])
    op.create_index('idx_equipment_department', 'equipment', ['department'])
    op.create_index('idx_equipment_health', 'equipment', ['health_percentage'])
    op.create_index('idx_equipment_status', 'equipment', ['status'])
    
    # === Maintenance Requests Table Updates ===
    op.add_column('maintenance_requests', sa.Column('reference', sa.String(50), nullable=True))
    op.add_column('maintenance_requests', sa.Column('maintenance_for', sa.String(50), nullable=True, server_default='equipment'))
    op.add_column('maintenance_requests', sa.Column('priority', sa.Integer(), nullable=True, server_default='2'))
    op.add_column('maintenance_requests', sa.Column('category', sa.String(100), nullable=True))
    op.add_column('maintenance_requests', sa.Column('request_date', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=True))
    op.add_column('maintenance_requests', sa.Column('notes', sa.Text(), nullable=True))
    op.add_column('maintenance_requests', sa.Column('instructions', sa.Text(), nullable=True))
    op.add_column('maintenance_requests', sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True))
    
    # Alter description to Text type
    op.alter_column('maintenance_requests', 'description', type_=sa.Text())
    
    # Alter scheduled_date to TIMESTAMP
    op.alter_column('maintenance_requests', 'scheduled_date', type_=sa.TIMESTAMP())
    
    # Create unique constraint on reference
    op.create_unique_constraint('uq_maintenance_requests_reference', 'maintenance_requests', ['reference'])
    
    # Create indexes
    op.create_index('idx_maintenance_requests_reference', 'maintenance_requests', ['reference'])
    op.create_index('idx_maintenance_requests_request_type', 'maintenance_requests', ['request_type'])
    op.create_index('idx_maintenance_requests_status', 'maintenance_requests', ['status'])
    op.create_index('idx_maintenance_requests_scheduled', 'maintenance_requests', ['scheduled_date'])
    
    # === Create Request History Table ===
    op.create_table('request_history',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('request_id', sa.UUID(), nullable=False),
        sa.Column('from_stage', sa.String(20), nullable=True),
        sa.Column('to_stage', sa.String(20), nullable=False),
        sa.Column('changed_by', sa.UUID(), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('duration_at_change', sa.Numeric(10, 2), nullable=True),
        sa.Column('changed_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['request_id'], ['maintenance_requests.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['changed_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_request_history_request', 'request_history', ['request_id'])
    op.create_index('idx_request_history_changed_at', 'request_history', ['changed_at'])
    
    # === Create Equipment Scrap Logs Table ===
    op.create_table('equipment_scrap_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('equipment_id', sa.UUID(), nullable=False),
        sa.Column('request_id', sa.UUID(), nullable=True),
        sa.Column('scrapped_by', sa.UUID(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('scrap_value', sa.Numeric(15, 2), nullable=True),
        sa.Column('disposal_method', sa.String(100), nullable=True),
        sa.Column('scrapped_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['equipment_id'], ['equipment.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['request_id'], ['maintenance_requests.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['scrapped_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_equipment_scrap_logs_equipment', 'equipment_scrap_logs', ['equipment_id'])
    op.create_index('idx_equipment_scrap_logs_scrapped_at', 'equipment_scrap_logs', ['scrapped_at'])


def downgrade() -> None:
    """Remove added fields and tables."""
    
    # Drop new tables
    op.drop_table('equipment_scrap_logs')
    op.drop_table('request_history')
    
    # Drop maintenance_requests indexes and constraints
    op.drop_index('idx_maintenance_requests_scheduled', 'maintenance_requests')
    op.drop_index('idx_maintenance_requests_status', 'maintenance_requests')
    op.drop_index('idx_maintenance_requests_request_type', 'maintenance_requests')
    op.drop_index('idx_maintenance_requests_reference', 'maintenance_requests')
    op.drop_constraint('uq_maintenance_requests_reference', 'maintenance_requests', type_='unique')
    
    # Drop maintenance_requests columns
    op.drop_column('maintenance_requests', 'updated_at')
    op.drop_column('maintenance_requests', 'instructions')
    op.drop_column('maintenance_requests', 'notes')
    op.drop_column('maintenance_requests', 'request_date')
    op.drop_column('maintenance_requests', 'category')
    op.drop_column('maintenance_requests', 'priority')
    op.drop_column('maintenance_requests', 'maintenance_for')
    op.drop_column('maintenance_requests', 'reference')
    
    # Drop equipment indexes and foreign key
    op.drop_index('idx_equipment_status', 'equipment')
    op.drop_index('idx_equipment_health', 'equipment')
    op.drop_index('idx_equipment_department', 'equipment')
    op.drop_index('idx_equipment_category', 'equipment')
    op.drop_index('idx_equipment_name', 'equipment')
    op.drop_constraint('fk_equipment_default_technician', 'equipment', type_='foreignkey')
    
    # Re-add is_scrapped column
    op.add_column('equipment', sa.Column('is_scrapped', sa.Boolean(), nullable=True, default=False))
    op.execute("UPDATE equipment SET is_scrapped = (status = 'scrapped')")
    
    # Drop equipment columns
    op.drop_column('equipment', 'updated_at')
    op.drop_column('equipment', 'notes')
    op.drop_column('equipment', 'status')
    op.drop_column('equipment', 'health_percentage')
    op.drop_column('equipment', 'warranty_info')
    op.drop_column('equipment', 'purchase_cost')
    op.drop_column('equipment', 'default_technician_id')
    
    # Drop maintenance_teams updates
    op.drop_constraint('fk_maintenance_teams_team_lead', 'maintenance_teams', type_='foreignkey')
    op.drop_column('maintenance_teams', 'updated_at')
    op.drop_column('maintenance_teams', 'color')
    op.drop_column('maintenance_teams', 'team_lead_id')
    
    # Drop users updates
    op.drop_index('idx_users_is_technician', 'users')
    op.drop_index('idx_users_name', 'users')
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'is_technician')
    op.drop_column('users', 'job_title')
    op.drop_column('users', 'department')
    op.drop_column('users', 'phone')

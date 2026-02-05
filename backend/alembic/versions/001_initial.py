"""initial migration

Revision ID: 001
Revises: 
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'analyses',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('thumbnail_url', sa.String(), nullable=True),
        sa.Column('verdict', sa.String(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('overall_score', sa.Float(), nullable=False),
        sa.Column('digital_footprint', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('pixel_physics', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('lighting_geometry', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('semantic_analysis', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('processing_time', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_analyses_created_at'), 'analyses', ['created_at'], unique=False)
    op.create_index(op.f('ix_analyses_verdict'), 'analyses', ['verdict'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_analyses_verdict'), table_name='analyses')
    op.drop_index(op.f('ix_analyses_created_at'), table_name='analyses')
    op.drop_table('analyses')

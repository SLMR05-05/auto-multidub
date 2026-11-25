-- Existing MySQL deployments with Hibernate ddl-auto=validate/none:
-- apply before deploying the POI editor workflow. Safe to re-run.
ALTER TABLE pois
    MODIFY COLUMN status ENUM('DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED')
    NOT NULL DEFAULT 'DRAFT';

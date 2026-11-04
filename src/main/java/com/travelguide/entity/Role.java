package com.travelguide.entity;

/**
 * CMS roles follow the PRD RBAC model:
 * ADMIN = full control, EDITOR = content, ANALYST = read-only dashboards.
 * USER is kept for the legacy travel-guide endpoints (mobile login).
 */
public enum Role {
    USER, ADMIN, EDITOR, ANALYST
}

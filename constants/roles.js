/**
 * Role and Permission Constants
 * Extracted from utils/auth.js for production-grade architecture
 */

export const ROLES = {
    ADMIN: 'Admin',
    FINANCE_MANAGER: 'Finance Manager',
    PROJECT_MANAGER: 'PM',
    FINANCE_USER: 'Finance User',
    VENDOR: 'Vendor',
    AUDITOR: 'Auditor'
};

export const MENU_PERMISSIONS = {
    'Dashboard': [ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.PROJECT_MANAGER, ROLES.FINANCE_USER, ROLES.VENDOR, ROLES.AUDITOR],
    'Digitization': [ROLES.ADMIN, ROLES.FINANCE_USER, ROLES.FINANCE_MANAGER],
    'Matching': [ROLES.ADMIN, ROLES.FINANCE_USER, ROLES.FINANCE_MANAGER, ROLES.PROJECT_MANAGER],
    'Approvals': [ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.PROJECT_MANAGER],
    'Vendors': [ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.FINANCE_USER, ROLES.VENDOR],
    'Analytics': [ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.AUDITOR],
    'Configuration': [ROLES.ADMIN],
    'User Management': [ROLES.ADMIN],
    'Audit Logs': [ROLES.ADMIN, ROLES.AUDITOR, ROLES.FINANCE_MANAGER]
};

/**
 * Check if user has permission for a specific action
 * @param {Object} user - User object with role property
 * @param {string} action - Action to check permission for
 * @returns {boolean} - Whether user has permission
 */
export const hasPermission = (user, action, resource = null) => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN) return true;

    const effectiveRole = user.role;

    // Auditor is strictly read-only
    if (effectiveRole === ROLES.AUDITOR && !action.startsWith('VIEW_')) {
        return false;
    }

    switch (action) {
        case 'CONFIGURE_SYSTEM':
        case 'MANAGE_USERS':
            return effectiveRole === ROLES.ADMIN;

        case 'APPROVE_MATCH':
            // PMs can only approve if the resource (invoice) belongs to their project
            if (effectiveRole === ROLES.PROJECT_MANAGER) {
                if (resource && resource.project) {
                    return user.assignedProjects?.includes(resource.project);
                }
                return true; // General permission check
            }
            return [ROLES.FINANCE_MANAGER, ROLES.FINANCE_USER].includes(effectiveRole);

        case 'FINALIZE_PAYMENT':
            return effectiveRole === ROLES.FINANCE_MANAGER;

        case 'PROCESS_DISCREPANCIES':
        case 'MANUAL_ENTRY':
            return [ROLES.FINANCE_USER, ROLES.FINANCE_MANAGER].includes(effectiveRole);

        case 'VIEW_AUDIT_LOGS':
        case 'VIEW_COMPLIANCE':
            return [ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.AUDITOR].includes(effectiveRole);

        case 'SUBMIT_INVOICE':
            return [ROLES.VENDOR, ROLES.FINANCE_USER].includes(effectiveRole);

        case 'VIEW_ALL_INVOICES':
            // Vendors and PMs have scoped views, so they don't have "VIEW_ALL"
            // But they can view "Invoices", just a subset.
            // This permission name might be misleading. Let's interpret it as "Access Invoice List"
            return [ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.FINANCE_USER, ROLES.AUDITOR, ROLES.PROJECT_MANAGER, ROLES.VENDOR].includes(effectiveRole);

        default:
            return false;
    }
};

/**
 * Check if user can see a specific menu item
 * @param {Object} user - User object with role property
 * @param {string} itemName - Menu item name
 * @returns {boolean} - Whether user can see the menu item
 */
export const canSeeMenuItem = (user, itemName) => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN) return true;
    const allowedRoles = MENU_PERMISSIONS[itemName];
    if (!allowedRoles) return true; // Default to visible if not defined
    return allowedRoles.includes(user.role);
};

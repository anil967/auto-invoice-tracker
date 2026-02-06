/**
 * Mock Authentication Utility
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
    'Vendors': [ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.FINANCE_USER],
    'Analytics': [ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.AUDITOR],
    'Configuration': [ROLES.ADMIN],
    'User Management': [ROLES.ADMIN]
};

export const hasPermission = (user, action) => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN) return true;

    const delegation = getDelegation();
    const effectiveRole = (delegation && delegation.active) ? delegation.delegateTo : user.role;

    // Auditor is strictly read-only
    if (effectiveRole === ROLES.AUDITOR && !action.startsWith('VIEW_')) {
        return false;
    }

    switch (action) {
        case 'CONFIGURE_SYSTEM':
        case 'MANAGE_USERS':
            return effectiveRole === ROLES.ADMIN;

        case 'APPROVE_MATCH':
            return [ROLES.PROJECT_MANAGER, ROLES.FINANCE_MANAGER, ROLES.FINANCE_USER].includes(effectiveRole);

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
            return [ROLES.ADMIN, ROLES.FINANCE_MANAGER, ROLES.FINANCE_USER, ROLES.AUDITOR].includes(effectiveRole);

        default:
            return false;
    }
};

export const canSeeMenuItem = (user, itemName) => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN) return true;
    const allowedRoles = MENU_PERMISSIONS[itemName];
    if (!allowedRoles) return true; // Default to visible if not defined
    return allowedRoles.includes(user.role);
};
export const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    const savedUser = localStorage.getItem('invoice_user');
    return savedUser ? JSON.parse(savedUser) : null;
};

export const getDelegation = () => {
    if (typeof window === 'undefined') return null;
    const delegation = localStorage.getItem('invoice_delegation');
    return delegation ? JSON.parse(delegation) : null;
};

export const setDelegation = (delegateToRole) => {
    const delegation = {
        delegateTo: delegateToRole,
        active: true,
        grantedAt: new Date().toISOString()
    };
    localStorage.setItem('invoice_delegation', JSON.stringify(delegation));
    window.dispatchEvent(new Event('auth-change'));
};

export const clearDelegation = () => {
    localStorage.removeItem('invoice_delegation');
    window.dispatchEvent(new Event('auth-change'));
};

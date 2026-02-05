/**
 * Mock Authentication Utility
 */

export const ROLES = {
    PROJECT_MANAGER: 'PM',
    FINANCE_USER: 'Finance User',
    FINANCE_MANAGER: 'Finance Manager',
    ADMIN: 'Admin',
    AUDITOR: 'Auditor'
};

const DEFAULT_USER = {
    id: 'user-001',
    name: 'Demo User',
    role: ROLES.FINANCE_USER // Default role
};

export const getCurrentUser = () => {
    if (typeof window === 'undefined') return DEFAULT_USER;

    const savedUser = localStorage.getItem('invoice_user');
    return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
};

export const switchRole = (role) => {
    const user = { ...DEFAULT_USER, role };
    localStorage.setItem('invoice_user', JSON.stringify(user));
    window.dispatchEvent(new Event('auth-change'));
    return user;
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

export const hasPermission = (user, action) => {
    if (user.role === ROLES.ADMIN) return true;

    const delegation = getDelegation();
    const effectiveRole = (delegation && delegation.active) ? delegation.delegateTo : user.role;

    switch (action) {
        case 'APPROVE_MATCH':
            return [ROLES.FINANCE_USER, ROLES.FINANCE_MANAGER, ROLES.PROJECT_MANAGER].includes(effectiveRole);
        case 'FINALIZE_PAYMENT':
            return effectiveRole === ROLES.FINANCE_MANAGER;
        case 'CONFIGURE_SYSTEM':
            return user.role === ROLES.ADMIN;
        case 'VIEW_AUDIT_LOGS':
            return [ROLES.ADMIN, ROLES.FINANCE_USER, ROLES.FINANCE_MANAGER, ROLES.AUDITOR].includes(effectiveRole);
        default:
            return false;
    }
};

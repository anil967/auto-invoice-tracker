const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000';

export const ingestInvoice = async (file) => {
    const formData = new FormData();
    formData.append('file', file); // Updated for Phase 12

    const response = await fetch(`${API_BASE_URL}/api/ingest`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to ingest invoice');
    }

    return response.json();
};

export const getAllInvoices = async () => {
    const response = await fetch(`${API_BASE_URL}/api/invoices`);
    if (!response.ok) {
        throw new Error('Failed to fetch invoices');
    }
    return response.json();
};

export const transitionWorkflow = async (id, action, comments = "") => {
    const { getCurrentUser } = await import("@/utils/auth");
    const user = getCurrentUser();

    const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/workflow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-role': user?.role || 'Guest'
        },
        body: JSON.stringify({ action, comments }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transition workflow');
    }
    return response.json();
};

export const getInvoiceStatus = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`);
        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error('Failed to fetch invoice status');
        }
        return response.json();
    } catch (e) {
        console.error("API Error: getInvoiceStatus", e);
        throw e;
    }
};

export const updateInvoiceApi = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update invoice');
    }
    return response.json();
};

export const getAnalytics = async () => {
    const response = await fetch(`${API_BASE_URL}/api/analytics`);
    if (!response.ok) {
        throw new Error('Failed to fetch analytics');
    }
    return response.json();
};

export const getAuditLogs = async (invoiceId) => {
    const { getCurrentUser } = await import("@/utils/auth");
    const user = getCurrentUser();

    // Build query
    const query = invoiceId ? `?invoiceId=${invoiceId}` : '';

    const response = await fetch(`${API_BASE_URL}/api/audit${query}`, {
        headers: {
            'x-user-role': user?.role || 'Guest'
        }
    });

    if (!response.ok) {
        // Silent fail for logs is often better than crashing UI, but we'll return empty
        console.warn("Failed to fetch audit logs");
        return [];
    }
    return response.json();
};

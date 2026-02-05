"use client";

const STORAGE_KEY = "invoiceflow_data";

// Initialize storage with data from public/data.json if empty
export const initStorage = async () => {
  if (typeof window === "undefined") return;

  const existingData = localStorage.getItem(STORAGE_KEY);
  
  if (!existingData) {
    try {
      const response = await fetch("/data.json");
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log("Storage initialized with mock data.");
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
  } else {
    try {
        return JSON.parse(existingData);
    } catch (e) {
        console.error("Corrupt local storage data, resetting.", e);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
    }
  }
};

// Get all invoices
export const getInvoices = () => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  try {
      return data ? JSON.parse(data) : [];
  } catch(e) {
      return [];
  }
};

// Get single invoice by ID
export const getInvoiceById = (id) => {
  const invoices = getInvoices();
  return invoices.find((inv) => inv.id === id) || null;
};

// Add new invoice
export const addInvoice = (invoice) => {
  const invoices = getInvoices();
  const newInvoice = { ...invoice, id: invoice.id || `INV-${Date.now()}` };
  const updatedInvoices = [...invoices, newInvoice];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
  return newInvoice;
};

// Update invoice
export const updateInvoice = (id, updates) => {
  const invoices = getInvoices();
  const index = invoices.findIndex((inv) => inv.id === id);
  if (index !== -1) {
    invoices[index] = { ...invoices[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    return invoices[index];
  }
  return null;
};

// Delete invoice
export const deleteInvoice = (id) => {
  const invoices = getInvoices();
  const updatedInvoices = invoices.filter((inv) => inv.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
  return true;
};
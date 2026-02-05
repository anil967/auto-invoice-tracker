/**
 * Load Testing Script - Invoice Tracking System
 * This script simulates multiple concurrent invoice uploads to the /api/ingest endpoint.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/ingest';
const CONCURRENT_USERS = 5;
const INVOICES_PER_USER = 2;
const TOTAL_EXPECTED = CONCURRENT_USERS * INVOICES_PER_USER;

async function uploadInvoice(userId, invoiceIndex) {
    const form = new FormData();
    // Simulate a simple dummy "invoice" content if no real file exists
    // In a real test, we'd use a variety of sample PDFs
    form.append('invoice', Buffer.from('Dummy Invoice Content'), 'test-invoice.txt');

    try {
        const start = Date.now();
        const response = await axios.post(API_URL, form, {
            headers: form.getHeaders(),
        });
        const duration = Date.now() - start;
        console.log(`[User ${userId}] Invoice ${invoiceIndex} uploaded in ${duration}ms. ID: ${response.data.id}`);
        return { success: true, duration };
    } catch (error) {
        console.error(`[User ${userId}] Upload failed:`, error.message);
        return { success: false };
    }
}

async function runLoadTest() {
    console.log(`--- Starting Load Test ---`);
    console.log(`Users: ${CONCURRENT_USERS}, Invoices/User: ${INVOICES_PER_USER}, Total: ${TOTAL_EXPECTED}`);

    const startTime = Date.now();
    const tasks = [];

    for (let u = 1; u <= CONCURRENT_USERS; u++) {
        for (let i = 1; i <= INVOICES_PER_USER; i++) {
            tasks.push(uploadInvoice(u, i));
        }
    }

    const results = await Promise.all(tasks);
    const endTime = Date.now();

    const successful = results.filter(r => r.success).length;
    const totalDuration = endTime - startTime;
    const avgLatency = results.filter(r => r.success).reduce((acc, r) => acc + r.duration, 0) / successful;

    console.log(`\n--- Test Results ---`);
    console.log(`Total Time: ${totalDuration}ms`);
    console.log(`Throughput: ${(successful / (totalDuration / 1000)).toFixed(2)} invoices/sec`);
    console.log(`Average Latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`Success Rate: ${(successful / TOTAL_EXPECTED * 100).toFixed(2)}%`);

    if (successful === TOTAL_EXPECTED) {
        console.log(`\nSuccess Criteria Met: System handled ${TOTAL_EXPECTED} concurrent uploads without errors.`);
    }
}

runLoadTest().catch(console.error);

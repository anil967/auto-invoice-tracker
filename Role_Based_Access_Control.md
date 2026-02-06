# Role-Based Access Control
Automated Invoice Tracking and Processing System
Document Version: 1.0
Date: February 06, 2026
Source: PRD - Automated Invoice Tracking and Processing System

## Overview
This document outlines the feature access permissions for each user role in the Automated Invoice Tracking and Processing System. The system implements role-based access control (RBAC) to ensure appropriate security and operational efficiency.

## 1. Admin
Complete system control with full administrative privileges

**Feature Access:**
• Full system configuration and settings management
• User account creation, modification, and deactivation
• Role and permission assignment
• System-wide reporting and analytics
• Integration configuration (SAP, Ringi Portal, SharePoint, Email)
• Audit log access and review
• Backup and disaster recovery management

## 2. Finance Manager
Senior financial authority with approval and oversight capabilities

**Feature Access:**
• Final invoice approval authority
• Payment release authorization
• Access to all financial reports and dashboards
• Invoice status tracking across all projects
• Vendor performance analytics
• End-to-end visibility of invoice lifecycle
• Audit trail review

## 3. Project Manager (PM)
Project-level invoice approval and vendor communication

**Feature Access:**
• Invoice approval/rejection for assigned projects
• Request additional information from vendors
• View invoices routed to them for approval
• Communicate with vendors regarding invoice issues
• Track approval status for their projects
• Receive notifications for pending approvals
• Access to project-specific invoice reports

## 4. Finance User
Operational processing and data management capabilities

**Feature Access:**
• Invoice data entry and processing
• Invoice status tracking and monitoring
• Data validation and correction
• Handle flagged discrepancies from 3-way matching
• Review low-confidence OCR extractions
• Process manual review queues
• Basic reporting for operational tracking

## 5. Vendor
Limited external access for invoice submission and tracking

**Feature Access:**
• Invoice submission through vendor portal
• Track submitted invoice status (limited view)
• Receive notifications (acknowledgment, rejection, payment confirmation)
• View their own invoice history only

**Restrictions:**
• No access to internal approval workflows
• No access to other vendors' data
• No access to system configuration

## 6. Auditor
Read-only access for compliance and audit purposes

**Feature Access:**
• Read-only access to all invoice records
• Complete audit trail review
• Compliance report generation
• Historical data access (7-year retention)
• Access to all system logs and timestamps

**Restrictions:**
• No modification capabilities
• No approval authority

## Summary Matrix

| Role | Create | Read | Update | Approve | Configure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | ✅ (3) | ✅ (3) | ✅ (3) | ✅ (3) | ✅ (3) |
| **Finance Manager** | — | ✅ (3) | — | ✅ (3) | — |
| **Project Manager** | — | ✅ (3) | — | ✅ (3) | — |
| **Finance User** | ✅ (3) | ✅ (3) | ✅ (3) | — | — |
| **Vendor** | ✅ (3) | Limited | — | — | — |
| **Auditor** | — | ✅ (3) | — | — | — |

## Notes
• The PRD does not provide granular feature-level permissions beyond these role descriptions.
• It is recommended to create a detailed RACI matrix or permission matrix during the design phase.
• This matrix should specify exactly which features each role can view, create, edit, or delete.
• All access is subject to security policies including TLS 1.2+, RBAC, AES-256 encryption, and SSO.

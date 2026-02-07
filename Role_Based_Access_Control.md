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

## 2. Project Manager (PM)
Project-level invoice approval and vendor communication

**Feature Access:**
• Invoice approval/rejection for assigned projects
• Request additional information from vendors
• View invoices routed to them for approval
• Communicate with vendors regarding invoice issues
• Track approval status for their projects
• Receive notifications for pending approvals
• Access to project-specific invoice reports

## 3. Finance User
Operational processing and data management capabilities

**Feature Access:**
• Invoice data entry and processing
• Invoice status tracking and monitoring
• Data validation and correction
• Handle flagged discrepancies from 3-way matching
• Review low-confidence OCR extractions
• Process manual review queues
• Basic reporting for operational tracking

## 4. Vendor
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

## Summary Matrix

| Role | Create | Read | Update | Approve | Configure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | ✅ (3) | ✅ (3) | ✅ (3) | ✅ (3) | ✅ (3) |
| **Project Manager** | — | ✅ (3) | — | ✅ (3) | — |
| **Finance User** | ✅ (3) | ✅ (3) | ✅ (3) | — | — |
| **Vendor** | ✅ (3) | Limited | — | — | — |

## Notes
• The PRD does not provide granular feature-level permissions beyond these role descriptions.
• It is recommended to create a detailed RACI matrix or permission matrix during the design phase.
• This matrix should specify exactly which features each role can view, create, edit, or delete.
• All access is subject to security policies including TLS 1.2+, RBAC, AES-256 encryption, and SSO.

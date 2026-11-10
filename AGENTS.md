# ERP Project - Agent Architecture & Development Guidelines

Welcome to the **ERP System** project repository. Every agent working in this workspace must adhere to the following architecture and development standards.

---

## 1. System Vision & Architecture
- **Domain**: Enterprise Resource Planning (ERP).
- **Target Deployment**: **Hostinger** compatible (optimized for Node.js app manager / VPS, efficient memory footprint, environment-variable configuration, static asset bundling).
- **Database**: **MySQL** (utf8mb4, strict mode, ACID transactions for financial and inventory movements, foreign key constraints, connection pooling).
- **Core Principles**:
  - **Modular Monorepo / Domain-Driven Design**: Keep distinct ERP domains (Sales, Inventory, Invoicing, Customers/Suppliers, HR, Settings) separated cleanly with their own data models, business logic, and UI components.
  - **Auditability**: All transactional operations (financial entries, inventory movements, status transitions) must include audit timestamps, user attribution, and immutable audit logs.
  - **Role-Based Access Control (RBAC)**: Enforce granular permissions (Admin, Manager, Staff, Read-Only) across all API endpoints and UI navigation.

---

## 2. Code Quality & Standards
- **Type Safety**: 100% strict typing on both backend and frontend.
- **Validation**: Strict schema validation on inputs before processing.
- **Error Handling**: Graceful error handling with human-readable error responses and structured error logs.
- **Testing**:
  - Component & integration tests for critical business workflows (e.g., invoice generation, inventory adjustments).
  - Use the installed Chrome DevTools MCP plugin to verify web interfaces, inspect network flows, and validate responsive layouts.

---

## 3. Workflow for Agents
1. Before implementing any major module, create an architectural plan and confirm specifications.
2. Build data models and migrations first.
3. Implement backend services and API validation.
4. Construct responsive, accessible UI views with loading and empty states.
5. Verify build, tests, and runtime integrity before committing changes.


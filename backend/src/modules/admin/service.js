import bcrypt from 'bcryptjs';
import { query } from '../../shared/database/index.js';
import { NotFoundError, ConflictError } from '../../shared/errors/ApiError.js';

async function logAudit(actorId, actionType, target, details) {
  try {
    const id = `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const detailsJson = typeof details === 'string' ? JSON.stringify({ message: details }) : JSON.stringify(details || {});
    await query(
      'INSERT INTO audit_logs (id, actor_id, action_type, target, details) VALUES ($1, $2, $3, $4, $5)',
      [id, actorId || 'SYSTEM', actionType, target, detailsJson]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

export class AdminService {
  async getEmployees() {
    const { rows } = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.department, u.designation,
             u.location_id, u.joining_date, u.employment_type, u.role, u.status, u.availability, u.created_at,
             l.name as location_name, l.city as location_city,
             m.team_lead_id, tl.name as team_lead_name,
             m.manager_id, mgr.name as manager_name
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      LEFT JOIN employee_manager_mappings m ON u.id = m.employee_id
      LEFT JOIN users tl ON m.team_lead_id = tl.id
      LEFT JOIN users mgr ON m.manager_id = mgr.id
      ORDER BY u.created_at DESC
    `);
    return rows;
  }

  async getTeamLeads() {
    const { rows } = await query("SELECT * FROM users WHERE role = 'TEAM_LEAD' AND status = 'ACTIVE' ORDER BY name ASC");
    return rows;
  }

  async getManagers() {
    const { rows } = await query("SELECT * FROM users WHERE (role = 'MANAGER' OR role = 'ADMIN') AND status = 'ACTIVE' ORDER BY name ASC");
    return rows;
  }

  async createEmployee(data, actorId) {
    const employeeId = data.employeeId.trim().toUpperCase();
    const email = data.email.trim().toLowerCase();

    // Check duplicate ID
    const { rows: existingId } = await query('SELECT id FROM users WHERE LOWER(id) = LOWER($1)', [employeeId]);
    if (existingId.length) {
      throw new ConflictError(`Employee ID "${employeeId}" is already assigned`);
    }

    // Check duplicate email
    const { rows: existingEmail } = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existingEmail.length) {
      throw new ConflictError(`Email "${email}" is already registered`);
    }

    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    const { rows: inserted } = await query(`
      INSERT INTO users (id, name, email, phone, password_hash, department, designation, location_id, joining_date, employment_type, role, status, availability)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ACTIVE', 'AVAILABLE')
      RETURNING id, name, email, phone, department, designation, location_id, joining_date, employment_type, role, status, availability, created_at
    `, [
      employeeId,
      data.name.trim(),
      email,
      data.phone?.trim() || '',
      defaultPasswordHash,
      data.department,
      data.designation?.trim() || '',
      data.locationId,
      data.joiningDate,
      data.employmentType,
      data.role
    ]);

    const newEmp = inserted[0];

    // Create mapping if specified
    if (data.teamLeadId || data.managerId) {
      await query(`
        INSERT INTO employee_manager_mappings (employee_id, team_lead_id, manager_id, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (employee_id)
        DO UPDATE SET team_lead_id = EXCLUDED.team_lead_id, manager_id = EXCLUDED.manager_id, updated_at = CURRENT_TIMESTAMP
      `, [employeeId, data.teamLeadId || null, data.managerId || null]);
    }

    // Log audit
    await logAudit(actorId, 'EMPLOYEE_CREATED', employeeId, `Created new ${newEmp.role} profile: ${newEmp.name}`);

    return newEmp;
  }

  async getMappings() {
    const { rows } = await query(`
      SELECT u.id, u.name, u.email, u.department, u.designation, u.role,
             l.name as location_name,
             tl.id as tl_id, tl.name as tl_name, tl.email as tl_email, tl.role as tl_role,
             mgr.id as mgr_id, mgr.name as mgr_name, mgr.email as mgr_email, mgr.role as mgr_role,
             m.updated_at
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      LEFT JOIN employee_manager_mappings m ON u.id = m.employee_id
      LEFT JOIN users tl ON m.team_lead_id = tl.id
      LEFT JOIN users mgr ON m.manager_id = mgr.id
      WHERE u.role != 'ADMIN'
      ORDER BY u.id ASC
    `);

    return rows.map(r => ({
      employee: {
        id: r.id,
        name: r.name,
        email: r.email,
        department: r.department,
        designation: r.designation,
        role: r.role,
        locationName: r.location_name || ''
      },
      teamLead: r.tl_id ? { id: r.tl_id, name: r.tl_name, email: r.tl_email, role: r.tl_role } : null,
      manager: r.mgr_id ? { id: r.mgr_id, name: r.mgr_name, email: r.mgr_email, role: r.mgr_role } : null,
      updatedAt: r.updated_at
    }));
  }

  async updateMapping(employeeId, data, actorId) {
    const { teamLeadId, managerId } = data;
    await query(`
      INSERT INTO employee_manager_mappings (employee_id, team_lead_id, manager_id, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (employee_id)
      DO UPDATE SET team_lead_id = EXCLUDED.team_lead_id, manager_id = EXCLUDED.manager_id, updated_at = CURRENT_TIMESTAMP
    `, [employeeId, teamLeadId || null, managerId || null]);

    await logAudit(actorId, 'MAPPING_UPDATED', employeeId, `Updated hierarchy mapping (TL: ${teamLeadId || 'None'}, Mgr: ${managerId || 'None'})`);

    return { employeeId, teamLeadId, managerId };
  }

  async getLocations() {
    const { rows } = await query(`
      SELECT l.id, l.name, l.city, l.state, l.country, l.timezone, l.code, l.active, l.created_at,
             (SELECT COUNT(*) FROM users u WHERE u.location_id = l.id) as total_employees,
             (SELECT COUNT(*) FROM holidays h WHERE h.location_id = l.id) as total_holidays,
             (SELECT COUNT(*) FROM leave_policies p WHERE p.location_id = l.id AND p.active = true) as active_policies_count
      FROM locations l
      ORDER BY l.created_at DESC
    `);
    return rows;
  }

  async createLocation(data, actorId) {
    const code = data.code.trim().toUpperCase();
    const id = `LOC-${code.replace(/[^A-Z0-9]/g, '')}`;

    const { rows: existing } = await query('SELECT id FROM locations WHERE code = $1', [code]);
    if (existing.length) {
      throw new ConflictError(`Location code "${code}" already exists`);
    }

    const { rows } = await query(`
      INSERT INTO locations (id, name, city, state, country, timezone, code, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *
    `, [id, data.name.trim(), data.city.trim(), data.state?.trim() || '', data.country.trim(), data.timezone, code]);

    await logAudit(actorId, 'LOCATION_CREATED', id, `Created corporate location: ${data.name}`);

    return rows[0];
  }

  async updateLocation(id, data, actorId) {
    const { rows } = await query(`
      UPDATE locations
      SET name = $1, city = $2, state = $3, country = $4, timezone = $5, code = $6,
          active = COALESCE($7, active), updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [
      data.name.trim(),
      data.city.trim(),
      data.state?.trim() || '',
      data.country.trim(),
      data.timezone,
      data.code.trim().toUpperCase(),
      data.active !== undefined ? data.active : null,
      id
    ]);

    if (!rows.length) throw new NotFoundError('Location not found');

    await logAudit(actorId, 'LOCATION_UPDATED', id, `Updated location: ${rows[0].name}`);

    return rows[0];
  }

  async getLeaveCategories() {
    const { rows } = await query('SELECT * FROM leave_categories ORDER BY created_at DESC');
    return rows;
  }

  async createLeaveCategory(data, actorId) {
    const code = data.code.trim().toUpperCase();
    const id = `CAT-${code.replace(/[^A-Z0-9]/g, '')}`;

    const { rows: existing } = await query('SELECT id FROM leave_categories WHERE code = $1', [code]);
    if (existing.length) {
      throw new ConflictError(`Category code "${code}" already exists`);
    }

    const { rows } = await query(`
      INSERT INTO leave_categories (id, name, code, paid, allow_full_day, allow_half_day, allow_hourly, active, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      id,
      data.name.trim(),
      code,
      data.paid !== undefined ? Boolean(data.paid) : true,
      data.allowFullDay !== undefined ? Boolean(data.allowFullDay) : true,
      data.allowHalfDay !== undefined ? Boolean(data.allowHalfDay) : true,
      data.allowHourly !== undefined ? Boolean(data.allowHourly) : false,
      data.active !== undefined ? Boolean(data.active) : true,
      data.description?.trim() || ''
    ]);

    await logAudit(actorId, 'CATEGORY_CREATED', id, `Created leave category: ${data.name}`);

    return rows[0];
  }

  async updateLeaveCategory(id, data, actorId) {
    const { rows } = await query(`
      UPDATE leave_categories
      SET name = $1, code = $2, paid = $3, allow_full_day = $4, allow_half_day = $5,
          allow_hourly = $6, active = $7, description = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [
      data.name.trim(),
      data.code.trim().toUpperCase(),
      Boolean(data.paid),
      Boolean(data.allowFullDay),
      Boolean(data.allowHalfDay),
      Boolean(data.allowHourly),
      Boolean(data.active),
      data.description?.trim() || '',
      id
    ]);

    if (!rows.length) throw new NotFoundError('Category not found');

    await logAudit(actorId, 'CATEGORY_UPDATED', id, `Updated leave category: ${rows[0].name}`);

    return rows[0];
  }

  async getLeavePolicies() {
    const { rows } = await query(`
      SELECT p.*, l.name as location_name, l.city as location_city,
             c.name as category_name, c.code as category_code
      FROM leave_policies p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN leave_categories c ON p.category_id = c.id
      ORDER BY p.location_id, p.category_id
    `);
    return rows;
  }

  async saveLeavePolicy(data, actorId) {
    const id = data.id || `POL-${data.locationId}-${data.categoryId}`;

    const { rows } = await query(`
      INSERT INTO leave_policies (
        id, location_id, category_id, annual_entitlement, monthly_accrual, max_balance,
        carry_forward_allowed, carry_forward_limit, expiry_allowed, expiry_months,
        min_notice_days, max_continuous_days, allow_hourly, allow_half_day, paid,
        require_supporting_document, doc_threshold_days, active, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP)
      ON CONFLICT (location_id, category_id)
      DO UPDATE SET
        annual_entitlement = EXCLUDED.annual_entitlement,
        monthly_accrual = EXCLUDED.monthly_accrual,
        max_balance = EXCLUDED.max_balance,
        carry_forward_allowed = EXCLUDED.carry_forward_allowed,
        carry_forward_limit = EXCLUDED.carry_forward_limit,
        expiry_allowed = EXCLUDED.expiry_allowed,
        expiry_months = EXCLUDED.expiry_months,
        min_notice_days = EXCLUDED.min_notice_days,
        max_continuous_days = EXCLUDED.max_continuous_days,
        allow_hourly = EXCLUDED.allow_hourly,
        allow_half_day = EXCLUDED.allow_half_day,
        paid = EXCLUDED.paid,
        require_supporting_document = EXCLUDED.require_supporting_document,
        doc_threshold_days = EXCLUDED.doc_threshold_days,
        active = EXCLUDED.active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      id,
      data.locationId,
      data.categoryId,
      Number(data.annualEntitlement || data.maxDaysPerYear || 0),
      Number(data.monthlyAccrual || 0),
      Number(data.maxBalance || 0),
      Boolean(data.carryForwardAllowed),
      data.carryForwardAllowed ? Number(data.carryForwardLimit || 0) : 0,
      Boolean(data.expiryAllowed),
      data.expiryAllowed ? Number(data.expiryMonths || 0) : 0,
      Number(data.minNoticeDays || 0),
      Number(data.maxContinuousDays || 0),
      Boolean(data.allowHourly),
      Boolean(data.allowHalfDay),
      data.paid !== undefined ? Boolean(data.paid) : true,
      Boolean(data.requireSupportingDocument || data.requiresDocumentation),
      Number(data.docThresholdDays || data.documentationDaysThreshold || 0),
      data.active !== undefined ? Boolean(data.active) : true
    ]);

    await logAudit(actorId, 'POLICY_CONFIGURED', id, `Configured policy for Location ${data.locationId} and Category ${data.categoryId}`);

    return rows[0];
  }

  async getApprovalWorkflows() {
    const { rows } = await query('SELECT * FROM approval_workflows ORDER BY min_days ASC');
    return rows;
  }

  async saveApprovalWorkflow(data, actorId) {
    const id = data.id || `WF-TIER-${Date.now()}`;
    const { rows } = await query(`
      INSERT INTO approval_workflows (id, name, min_days, max_days, approvers, description, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        min_days = EXCLUDED.min_days,
        max_days = EXCLUDED.max_days,
        approvers = EXCLUDED.approvers,
        description = EXCLUDED.description,
        active = EXCLUDED.active
      RETURNING *
    `, [
      id,
      data.name.trim(),
      Number(data.minDays),
      Number(data.maxDays),
      JSON.stringify(data.approvers || []),
      data.description?.trim() || '',
      data.active !== undefined ? Boolean(data.active) : true
    ]);

    await logAudit(actorId, 'WORKFLOW_CONFIGURED', id, `Configured approval tier: ${data.name}`);

    return rows[0];
  }

  async getAuditLogs() {
    const { rows } = await query(`
      SELECT a.id, a.actor_id, u.name as actor_name, u.role as actor_role,
             a.action_type, a.target,
             CASE 
               WHEN a.details ? 'message' THEN a.details->>'message'
               ELSE a.details::text
             END as details,
             a.timestamp
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_id = u.id
      ORDER BY a.timestamp DESC
      LIMIT 200
    `);
    return rows;
  }

  async getStats() {
    const { rows: users } = await query('SELECT role, status, id FROM users');
    const { rows: locations } = await query('SELECT active FROM locations');
    const { rows: policies } = await query('SELECT active FROM leave_policies');
    const { rows: categories } = await query('SELECT active FROM leave_categories');
    const { rows: mappings } = await query('SELECT employee_id, team_lead_id, manager_id FROM employee_manager_mappings');

    const totalEmployees = users.length;
    const activeEmployees = users.filter(u => u.status === 'ACTIVE').length;
    const teamLeads = users.filter(u => u.role === 'TEAM_LEAD').length;
    const managers = users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN').length;
    const totalLocations = locations.length;
    const activeLocations = locations.filter(l => l.active).length;
    const totalCategories = categories.length;
    const activePolicies = policies.filter(p => p.active).length;

    const mappedIds = new Set(mappings.filter(m => m.manager_id || m.team_lead_id).map(m => m.employee_id));
    const unmappedEmployees = users.filter(u => u.role === 'EMPLOYEE' && !mappedIds.has(u.id)).length;
    const totalPotentialPolicies = activeLocations * categories.filter(c => c.active).length;
    const missingPolicies = Math.max(0, totalPotentialPolicies - activePolicies);

    return {
      totalEmployees,
      activeEmployees,
      teamLeads,
      managers,
      totalLocations,
      activeLocations,
      totalCategories,
      activePolicies,
      pendingConfigurations: unmappedEmployees + (missingPolicies > 0 ? 1 : 0),
      unmappedEmployees,
      missingPolicies
    };
  }
}

export const adminService = new AdminService();

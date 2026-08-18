import React from 'react';
import { User, ArrowRight, ShieldAlert, ArrowDown, Edit3 } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { Button } from '../common/Button.jsx';

/**
 * Visual 3-tier organizational hierarchy display:
 * Employee → Team Lead → Manager
 */
export const HierarchyTree = ({ mapping, onEdit }) => {
  const { employee, teamLead, manager } = mapping;

  return (
    <div className="hierarchy-card-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
            HIERARCHY CHAIN • {employee.department}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>•</span>
          <span style={{ fontSize: '11px', color: 'var(--info-blue)', fontWeight: 600 }}>{employee.locationName}</span>
        </div>
        {onEdit && (
          <Button variant="ghost" size="sm" icon={Edit3} onClick={() => onEdit(mapping)}>
            Edit Mapping
          </Button>
        )}
      </div>

      <div className="hierarchy-flow-row">
        {/* Tier 1: Employee */}
        <div className="hierarchy-node-box node-employee">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--info-blue-subtle)',
              color: 'var(--info-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <User size={18} />
          </div>
          <div className="node-meta">
            <div className="node-name">{employee.name}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {employee.id} • {employee.designation}
            </div>
            <div style={{ marginTop: '4px' }}>
              <StatusBadge status="EMPLOYEE" variant="info" showDot={false} />
            </div>
          </div>
        </div>

        <div className="hierarchy-connector-arrow">
          <ArrowRight size={20} />
        </div>

        {/* Tier 2: Team Lead */}
        {teamLead ? (
          <div className="hierarchy-node-box node-tl">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--status-warning-subtle)',
                color: 'var(--status-warning-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <User size={18} />
            </div>
            <div className="node-meta">
              <div className="node-name">{teamLead.name}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                {teamLead.id} • Team Lead
              </div>
              <div style={{ marginTop: '4px' }}>
                <StatusBadge status="TEAM LEAD" variant="warning" showDot={false} />
              </div>
            </div>
          </div>
        ) : (
          <div className="hierarchy-node-box node-empty">
            <div style={{ fontSize: '12px', fontStyle: 'italic' }}>No Team Lead assigned (Direct Manager report)</div>
          </div>
        )}

        <div className="hierarchy-connector-arrow">
          <ArrowRight size={20} />
        </div>

        {/* Tier 3: Manager */}
        {manager ? (
          <div className="hierarchy-node-box node-mgr">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-orange-subtle)',
                color: 'var(--primary-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <User size={18} />
            </div>
            <div className="node-meta">
              <div className="node-name">{manager.name}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                {manager.id} • Department Manager
              </div>
              <div style={{ marginTop: '4px' }}>
                <StatusBadge status="MANAGER" variant="primary" showDot={false} />
              </div>
            </div>
          </div>
        ) : (
          <div className="hierarchy-node-box node-empty" style={{ borderColor: 'var(--status-danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-danger-text)', fontSize: '12px' }}>
              <ShieldAlert size={15} />
              <span>Unassigned Manager (Escalation Gap)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

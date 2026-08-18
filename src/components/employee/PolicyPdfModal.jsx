import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Printer, Download, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { pdfService } from '../../services/pdfService.js';

/**
 * Official Policy PDF Viewer & Printable Layout Modal
 */
export const PolicyPdfModal = ({ isOpen, onClose, policy, employee }) => {
  if (!policy) return null;

  const doc = pdfService.generatePolicyDocument(policy, employee);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Leave Policy Document"
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="ghost" onClick={onClose}>
            Close Document
          </Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" icon={Printer} onClick={handlePrint}>
              Print Policy
            </Button>
            <Button variant="primary" icon={Download} onClick={handlePrint}>
              Download PDF
            </Button>
          </div>
        </div>
      }
    >
      <div
        id="printable-policy-doc"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          fontFamily: 'var(--font-sans)',
          color: '#1e293b'
        }}
      >
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid var(--primary-orange)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-orange)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              NexLeave Corporate HR Compliance
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--nav-dark)', marginTop: '4px' }}>
              {doc.title}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Jurisdiction: <strong>{doc.employee.location}</strong> | Policy Ref: <code>{doc.documentId}</code>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            <div>Effective: <strong>{doc.effectiveDate}</strong></div>
            <div>Revision: <strong>{doc.lastRevised}</strong></div>
          </div>
        </div>

        {/* Employee Applicability Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Applies To: </span>
            <strong>{doc.employee.name} ({doc.employee.id})</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Department: </span>
            <strong>{doc.employee.department}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Location: </span>
            <strong>{doc.employee.location}</strong>
          </div>
        </div>

        {/* Core Rules Table */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            1. Entitlement & Accrual Matrix
          </h4>
          <table className="table" style={{ fontSize: '12.5px' }}>
            <tbody>
              <tr>
                <td style={{ width: '40%', fontWeight: 600, color: 'var(--text-secondary)' }}>Leave Classification</td>
                <td><strong>{doc.policy.categoryName} ({doc.policy.categoryCode})</strong></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Remuneration Status</td>
                <td>{doc.policy.paid ? 'Fully Paid Leave' : 'Loss of Pay (Unpaid)'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Annual Statutory Entitlement</td>
                <td><strong>{doc.policy.annualEntitlement} Days per annum</strong></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Monthly Accrual Rate</td>
                <td>{doc.policy.monthlyAccrual} Days credited at end of each calendar month</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Maximum Accumulation Cap</td>
                <td>{doc.policy.maxBalance} Days maximum allowed in balance pool</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Carry Forward to Next Year</td>
                <td>{doc.policy.carryForwardAllowed ? `Permitted up to ${doc.policy.carryForwardLimit} Days` : 'Not Allowed (Expires annually)'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Application Constraints */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            2. Request Rules & Minimum Notice
          </h4>
          <table className="table" style={{ fontSize: '12.5px' }}>
            <tbody>
              <tr>
                <td style={{ width: '40%', fontWeight: 600, color: 'var(--text-secondary)' }}>Minimum Advance Notice</td>
                <td>{doc.policy.minNoticeDays > 0 ? `${doc.policy.minNoticeDays} Business Days in advance` : 'Zero Notice (Immediate / Emergency permitted)'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Maximum Consecutive Leave Span</td>
                <td>{doc.policy.maxContinuousDays} Days continuous without HR special authorization</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Half-Day Sessions Allowed</td>
                <td>{doc.policy.allowHalfDay ? 'Yes (First Half or Second Half)' : 'No (Full days only)'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Hourly Permissions Allowed</td>
                <td>{doc.policy.allowHourly ? 'Yes (Calculated based on 8-hour workday standard)' : 'No (Daily increments only)'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Medical / Document Proof</td>
                <td>{doc.policy.requireSupportingDocument ? `Mandatory for leave durations exceeding ${doc.policy.docThresholdDays} days` : 'Not mandatory'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Governance & Approval Workflow */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            3. Multi-Tier Governance & Approval Workflow
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px' }}>
            {doc.approvalWorkflow.map((wf, idx) => (
              <div key={idx} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-secondary)' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary-orange)' }}>{wf.tier}</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{wf.role}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Scope: {wf.scope}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Signature Notice */}
        <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '24px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          <span>Generated dynamically by NexLeave Enterprise HRMS Engine</span>
          <span>Verified & Digitally Sealed</span>
        </div>
      </div>
    </Modal>
  );
};

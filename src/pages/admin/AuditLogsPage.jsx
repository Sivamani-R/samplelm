import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Search, Filter, ShieldCheck, Clock, User } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { auditService } from '../../services/auditService.js';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditService.fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to load system audit trail');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        !search ||
        log.actorName.toLowerCase().includes(search.toLowerCase()) ||
        log.target.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase());

      const matchAction = !actionFilter || log.actionType === actionFilter;

      return matchSearch && matchAction;
    });
  }, [logs, search, actionFilter]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.actionType)));
  }, [logs]);

  const columns = [
    {
      header: 'Timestamp',
      key: 'timestamp',
      width: '180px',
      render: (row) => (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Clock size={12} color="var(--text-tertiary)" />
          {new Date(row.timestamp).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Actor / User',
      key: 'actorName',
      width: '200px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} color="var(--info-blue)" />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '12.5px' }}>{row.actorName}</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {row.actorId}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Action Type',
      key: 'actionType',
      width: '180px',
      render: (row) => (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--primary-orange)'
          }}
        >
          {row.actionType}
        </span>
      )
    },
    {
      header: 'Target Entity',
      key: 'target',
      width: '160px',
      render: (row) => <span style={{ fontWeight: 600, fontSize: '12.5px' }}>{row.target}</span>
    },
    {
      header: 'Audit Event Description & Payload',
      key: 'details',
      render: (row) => (
        <span style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {row.details}
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="System Governance & Audit Trail"
        description="Immutable activity records tracking administrative configurations, employee credential creation, and policy updates."
      />

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search activity records..."
        />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="form-select"
            style={{ width: '220px', padding: '6px 10px', fontSize: '12.5px' }}
          >
            <option value="">All Action Types</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          {(search || actionFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setActionFilter('');
              }}
              style={{ fontSize: '12.5px', color: 'var(--primary-orange)', fontWeight: 600 }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Fetching system audit log records..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadLogs} />
      ) : (
        <Table columns={columns} data={filteredLogs} keyField="id" pageSize={12} />
      )}
    </div>
  );
};

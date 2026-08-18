import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getHome = () => {
    if (!user) return '/login';
    if (user.role === ROLES.ADMIN) return '/admin';
    if (user.role === ROLES.TEAM_LEAD) return '/team-lead';
    if (user.role === ROLES.MANAGER) return '/manager';
    return '/employee';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-page)'
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-secondary)',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}
        >
          <FileQuestion size={32} />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          404 — Page Not Found
        </h1>

        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          The requested system endpoint or administrative URL does not exist or has been moved.
        </p>

        <Button variant="primary" size="md" icon={ArrowLeft} onClick={() => navigate(getHome())}>
          Go to Home
        </Button>
      </div>
    </div>
  );
};

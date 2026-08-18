import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * Reusable Empty State Display
 */
export const EmptyState = ({
  title = 'No Data Found',
  description = 'No records match the selected parameters or filters.',
  icon: Icon = Inbox,
  actionLabel = null,
  onAction = null,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-icon-wrap">
        <Icon size={28} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

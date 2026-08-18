import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component
 * Variants: 'primary' (Orange), 'secondary' (Navy), 'outline', 'subtle-orange', 'danger', 'ghost'
 * Sizes: 'sm', 'md', 'lg'
 */
export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  const isButtonLoading = isLoading || loading || false;
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'md' ? '' : `btn-${size}`;
  const isDisabled = disabled || isButtonLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      {isButtonLoading && <Loader2 className="spinner-sm" style={{ animation: 'spin 0.7s linear infinite' }} />}
      {!isButtonLoading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
      {!isButtonLoading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </button>
  );
};

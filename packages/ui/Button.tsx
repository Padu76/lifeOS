import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Icon to display on the left */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right */
  rightIcon?: React.ReactNode;
  /** Make button full width */
  fullWidth?: boolean;
  /** Rounded corners variant */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Children content */
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = 'md',
  disabled = false,
  children,
  className = '',
  style,
  ...props
}) => {
  // Base styles
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  // Size variants
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '6px 12px',
      fontSize: '14px',
      minHeight: '32px',
    },
    md: {
      padding: '8px 16px',
      fontSize: '16px',
      minHeight: '40px',
    },
    lg: {
      padding: '12px 24px',
      fontSize: '18px',
      minHeight: '48px',
    }
  };

  // Rounded variants
  const roundedStyles: Record<string, React.CSSProperties> = {
    none: { borderRadius: '0px' },
    sm: { borderRadius: '4px' },
    md: { borderRadius: '8px' },
    lg: { borderRadius: '12px' },
    full: { borderRadius: '9999px' }
  };

  // Color variants
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#007AFF',
      color: 'white',
      boxShadow: '0 1px 3px rgba(0, 122, 255, 0.3)',
    },
    secondary: {
      backgroundColor: '#F2F2F7',
      color: '#1D1D1F',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    danger: {
      backgroundColor: '#FF3B30',
      color: 'white',
      boxShadow: '0 1px 3px rgba(255, 59, 48, 0.3)',
    },
    success: {
      backgroundColor: '#34C759',
      color: 'white',
      boxShadow: '0 1px 3px rgba(52, 199, 89, 0.3)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#007AFF',
      boxShadow: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#007AFF',
      border: '2px solid #007AFF',
      boxShadow: 'none',
    }
  };

  // Hover styles
  const getHoverStyles = (variant: string): React.CSSProperties => {
    const hoverMap: Record<string, React.CSSProperties> = {
      primary: { backgroundColor: '#0056CC', transform: 'translateY(-1px)' },
      secondary: { backgroundColor: '#E5E5EA', transform: 'translateY(-1px)' },
      danger: { backgroundColor: '#D70015', transform: 'translateY(-1px)' },
      success: { backgroundColor: '#248A3D', transform: 'translateY(-1px)' },
      ghost: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
      outline: { backgroundColor: 'rgba(0, 122, 255, 0.1)' }
    };
    return hoverMap[variant] || {};
  };

  // Disabled styles
  const disabledStyles: React.CSSProperties = disabled || loading ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  } : {};

  // Full width styles
  const fullWidthStyles: React.CSSProperties = fullWidth ? {
    width: '100%'
  } : {};

  // Combine all styles
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...roundedStyles[rounded],
    ...variantStyles[variant],
    ...disabledStyles,
    ...fullWidthStyles,
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div
      style={{
        width: '16px',
        height: '16px',
        border: '2px solid transparent',
        borderTop: '2px solid currentColor',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );

  // Add CSS animation keyframes if not already present
  React.useEffect(() => {
    const styleSheet = document.styleSheets[0];
    const keyframes = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    
    try {
      styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
    } catch (e) {
      // Keyframes might already exist
    }
  }, []);

  return (
    <button
      className={className}
      style={combinedStyles}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-label={loading ? 'Loading...' : props['aria-label']}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, getHoverStyles(variant));
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid #007AFF';
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{leftIcon}</span>}
      <span style={{ display: 'flex', alignItems: 'center' }}>{children}</span>
      {!loading && rightIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{rightIcon}</span>}
    </button>
  );
};

export default Button;

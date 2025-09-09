import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant style */
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'minimal';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Make card clickable */
  clickable?: boolean;
  /** Header content */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Hover effect */
  hoverable?: boolean;
  /** Border radius variant */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Background color variant */
  background?: 'white' | 'gray' | 'transparent' | 'primary' | 'success' | 'warning' | 'error';
  /** Children content */
  children: React.ReactNode;
  /** Click handler when clickable */
  onCardClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  clickable = false,
  header,
  footer,
  hoverable = false,
  rounded = 'md',
  background = 'white',
  children,
  onCardClick,
  className = '',
  style,
  ...props
}) => {
  // Base styles
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'all 0.2s ease-in-out',
    cursor: clickable ? 'pointer' : 'default',
    outline: 'none',
    ...style
  };

  // Padding variants
  const paddingStyles: Record<string, React.CSSProperties> = {
    none: { padding: '0' },
    sm: { padding: '8px' },
    md: { padding: '16px' },
    lg: { padding: '24px' },
    xl: { padding: '32px' }
  };

  // Rounded variants
  const roundedStyles: Record<string, React.CSSProperties> = {
    none: { borderRadius: '0px' },
    sm: { borderRadius: '4px' },
    md: { borderRadius: '12px' },
    lg: { borderRadius: '16px' },
    xl: { borderRadius: '24px' }
  };

  // Background variants
  const backgroundStyles: Record<string, React.CSSProperties> = {
    white: { backgroundColor: '#FFFFFF' },
    gray: { backgroundColor: '#F2F2F7' },
    transparent: { backgroundColor: 'transparent' },
    primary: { backgroundColor: '#007AFF', color: 'white' },
    success: { backgroundColor: '#34C759', color: 'white' },
    warning: { backgroundColor: '#FF9500', color: 'white' },
    error: { backgroundColor: '#FF3B30', color: 'white' }
  };

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      border: '1px solid #E5E5EA',
      backgroundColor: '#FFFFFF',
      boxShadow: 'none',
    },
    elevated: {
      border: 'none',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    },
    outlined: {
      border: '2px solid #007AFF',
      backgroundColor: '#FFFFFF',
      boxShadow: 'none',
    },
    glass: {
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    minimal: {
      border: 'none',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    }
  };

  // Hover styles
  const getHoverStyles = (): React.CSSProperties => {
    if (!hoverable && !clickable) return {};
    
    const hoverMap: Record<string, React.CSSProperties> = {
      default: { 
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-2px)'
      },
      elevated: { 
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-4px)'
      },
      outlined: { 
        borderColor: '#0056CC',
        boxShadow: '0 0 0 4px rgba(0, 122, 255, 0.1)'
      },
      glass: { 
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        transform: 'translateY(-2px)'
      },
      minimal: { 
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        transform: 'translateY(-1px)'
      }
    };
    
    return hoverMap[variant] || {};
  };

  // Focus styles
  const focusStyles: React.CSSProperties = clickable ? {
    outline: '2px solid #007AFF',
    outlineOffset: '2px'
  } : {};

  // Combine all styles
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...paddingStyles[padding],
    ...roundedStyles[rounded],
    ...variantStyles[variant],
    ...backgroundStyles[background],
  };

  // Header styles
  const headerStyles: React.CSSProperties = {
    marginBottom: header && children ? '12px' : '0',
    paddingBottom: header && children ? '12px' : '0',
    borderBottom: header && children ? '1px solid #E5E5EA' : 'none',
  };

  // Footer styles
  const footerStyles: React.CSSProperties = {
    marginTop: footer && children ? '12px' : '0',
    paddingTop: footer && children ? '12px' : '0',
    borderTop: footer && children ? '1px solid #E5E5EA' : 'none',
  };

  // Content wrapper styles
  const contentStyles: React.CSSProperties = {
    flex: 1,
  };

  const handleClick = () => {
    if (clickable && onCardClick) {
      onCardClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={className}
      style={combinedStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={clickable ? 0 : -1}
      role={clickable ? 'button' : undefined}
      aria-pressed={clickable ? false : undefined}
      onMouseEnter={(e) => {
        if (hoverable || clickable) {
          Object.assign(e.currentTarget.style, getHoverStyles());
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || clickable) {
          Object.assign(e.currentTarget.style, {
            ...variantStyles[variant],
            transform: 'none'
          });
        }
      }}
      onFocus={(e) => {
        if (clickable) {
          Object.assign(e.currentTarget.style, focusStyles);
        }
      }}
      onBlur={(e) => {
        if (clickable) {
          e.currentTarget.style.outline = 'none';
        }
      }}
      {...props}
    >
      {header && (
        <div style={headerStyles}>
          {header}
        </div>
      )}
      
      <div style={contentStyles}>
        {children}
      </div>
      
      {footer && (
        <div style={footerStyles}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

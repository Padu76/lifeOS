import React from 'react';

export interface TypographyProps {
  /** HTML element to render */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'small' | 'strong' | 'em';
  /** Typography variant for predefined styles */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption' | 'overline';
  /** Font weight */
  weight?: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  /** Text color variant */
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error' | 'white' | 'inherit';
  /** Font size variant */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Text transform */
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  /** Line height */
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  /** Text decoration */
  decoration?: 'none' | 'underline' | 'line-through';
  /** Make text truncated with ellipsis */
  truncate?: boolean;
  /** Maximum number of lines before truncation */
  lineClamp?: number;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Children content */
  children: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
  as,
  variant = 'body1',
  weight = 'normal',
  color = 'primary',
  size,
  align = 'left',
  transform = 'none',
  lineHeight = 'normal',
  decoration = 'none',
  truncate = false,
  lineClamp,
  className = '',
  style,
  children,
  ...props
}) => {
  // Determine the HTML element to render
  const getElement = (): keyof JSX.IntrinsicElements => {
    if (as) return as;
    
    // Auto-determine element based on variant
    const variantElementMap: Record<string, keyof JSX.IntrinsicElements> = {
      h1: 'h1',
      h2: 'h2', 
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      body1: 'p',
      body2: 'p',
      subtitle1: 'p',
      subtitle2: 'p',
      caption: 'span',
      overline: 'span',
    };
    
    return variantElementMap[variant] || 'p';
  };

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      lineHeight: 1.2,
      marginBottom: '0.5em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 'bold',
      lineHeight: 1.3,
      marginBottom: '0.5em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: '600',
      lineHeight: 1.3,
      marginBottom: '0.5em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: '500',
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: '500',
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 'normal',
      lineHeight: 1.6,
      marginBottom: '1em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 'normal',
      lineHeight: 1.5,
      marginBottom: '1em',
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: '500',
      lineHeight: 1.5,
      marginBottom: '0.5em',
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: '500',
      lineHeight: 1.5,
      marginBottom: '0.5em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 'normal',
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: '500',
      lineHeight: 1.4,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '0.5em',
    },
  };

  // Weight styles
  const weightStyles: Record<string, React.CSSProperties> = {
    thin: { fontWeight: '100' },
    light: { fontWeight: '300' },
    normal: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    semibold: { fontWeight: '600' },
    bold: { fontWeight: '700' },
    extrabold: { fontWeight: '800' },
    black: { fontWeight: '900' },
  };

  // Color styles
  const colorStyles: Record<string, React.CSSProperties> = {
    primary: { color: '#1D1D1F' },
    secondary: { color: '#86868B' },
    muted: { color: '#6E6E73' },
    accent: { color: '#007AFF' },
    success: { color: '#34C759' },
    warning: { color: '#FF9500' },
    error: { color: '#FF3B30' },
    white: { color: '#FFFFFF' },
    inherit: { color: 'inherit' },
  };

  // Size styles (overrides variant size if specified)
  const sizeStyles: Record<string, React.CSSProperties> = {
    xs: { fontSize: '0.75rem' },
    sm: { fontSize: '0.875rem' },
    base: { fontSize: '1rem' },
    lg: { fontSize: '1.125rem' },
    xl: { fontSize: '1.25rem' },
    '2xl': { fontSize: '1.5rem' },
    '3xl': { fontSize: '1.875rem' },
    '4xl': { fontSize: '2.25rem' },
    '5xl': { fontSize: '3rem' },
    '6xl': { fontSize: '3.75rem' },
  };

  // Line height styles
  const lineHeightStyles: Record<string, React.CSSProperties> = {
    none: { lineHeight: 1 },
    tight: { lineHeight: 1.25 },
    snug: { lineHeight: 1.375 },
    normal: { lineHeight: 1.5 },
    relaxed: { lineHeight: 1.625 },
    loose: { lineHeight: 2 },
  };

  // Base styles
  const baseStyles: React.CSSProperties = {
    margin: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    textAlign: align,
    textTransform: transform,
    textDecoration: decoration,
    ...style,
  };

  // Truncation styles
  const truncationStyles: React.CSSProperties = truncate ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } : {};

  // Line clamp styles
  const lineClampStyles: React.CSSProperties = lineClamp ? {
    display: '-webkit-box',
    WebkitLineClamp: lineClamp,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } : {};

  // Combine all styles
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...weightStyles[weight],
    ...colorStyles[color],
    ...(size ? sizeStyles[size] : {}),
    ...lineHeightStyles[lineHeight],
    ...truncationStyles,
    ...lineClampStyles,
  };

  // Remove margin bottom for certain elements when used inline
  const Element = getElement();
  if (Element === 'span' || Element === 'strong' || Element === 'em') {
    combinedStyles.marginBottom = '0';
  }

  return React.createElement(
    Element,
    {
      className,
      style: combinedStyles,
      ...props,
    },
    children
  );
};

export default Typography;

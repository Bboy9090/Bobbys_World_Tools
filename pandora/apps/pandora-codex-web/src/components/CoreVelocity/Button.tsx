import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
  disabled = false,
  className = '',
}) => {
  const baseStyles = 'font-inter font-500 transition-all duration-300 rounded-lg focus:outline-none';

  const variants = {
    primary: 'bg-velocity-blue text-white hover:shadow-velocity-glow disabled:opacity-50',
    secondary: 'bg-velocity-graphite text-velocity-cyan border border-velocity-blue hover:border-velocity-cyan',
    danger: 'bg-velocity-danger text-white hover:bg-red-700 disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

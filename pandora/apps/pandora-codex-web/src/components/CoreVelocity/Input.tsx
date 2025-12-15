import React from 'react';

interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full px-4 py-2.5 bg-velocity-black border border-velocity-cyan/40 
        text-velocity-white placeholder-velocity-cyan/60 rounded-lg
        focus:border-velocity-cyan focus:shadow-cyan-glow/30 focus:outline-none
        transition-all duration-300 font-mono
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    />
  );
};

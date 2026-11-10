import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  id, 
  className = '', 
  ...props 
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-text-main tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`px-4 py-2 rounded-sm border-2 focus:outline-none focus:border-primary transition-colors ${
          error ? 'border-danger' : 'border-border'
        } bg-surface`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-danger">{error}</span>}
    </div>
  );
};

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded font-semibold transition-colors duration-200";
  const primaryStyle = "bg-blue-600 text-white hover:bg-blue-700";
  const secondaryStyle = "bg-gray-200 text-gray-900 hover:bg-gray-300";
  
  const variantStyle = variant === 'primary' ? primaryStyle : secondaryStyle;

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};

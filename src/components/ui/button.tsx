import React from 'react'
import './button.css' // 新しいCSSファイルをインポート

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost'
  size?: 'default' | 'icon'
}

export const Button: React.FC<ButtonProps> = ({
                                                children,
                                                className = '',
                                                variant = 'default',
                                                size = 'default',
                                                ...props
                                              }) => {
  const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100'
  }
  const sizeStyles = {
    default: 'px-4 py-2',
    icon: 'p-2'
  }

  return (
      <button
          className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
          {...props}
      >
        {children}
      </button>
  )
}
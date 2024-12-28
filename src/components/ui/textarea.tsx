import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  return (
    <textarea 
      className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none ${className}`} 
      {...props}
    />
  )
}


import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-brand-text mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-lg border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-orange'
        } focus:border-transparent focus:outline-none focus:ring-2 bg-white text-brand-text`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

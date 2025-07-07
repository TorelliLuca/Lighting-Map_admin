import { forwardRef } from 'react'

const Select = forwardRef(({ 
  label, 
  options = [], 
  error, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-blue-300 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md shadow-sm 
          placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:border-blue-500 text-white ${error ? 'border-red-500' : ''} ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

export default Select

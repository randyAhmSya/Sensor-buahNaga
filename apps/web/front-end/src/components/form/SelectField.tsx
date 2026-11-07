import type { SelectHTMLAttributes, ReactNode } from 'react'
import { useFormContext, type RegisterOptions } from 'react-hook-form'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string
  label?: string
  helperText?: string
  options: SelectOption[]
  leftIcon?: ReactNode
  rules?: RegisterOptions
  placeholderOption?: string
}

export function SelectField({
  name,
  label,
  helperText,
  options,
  leftIcon,
  className,
  rules,
  placeholderOption = 'Pilih salah satu opsi...',
  id,
  ...rest
}: SelectFieldProps) {
  const formContext = useFormContext()
  const selectId = id || `select-${name}`

  const register = formContext ? formContext.register : undefined
  const error = formContext?.formState?.errors?.[name]
  const errorMessage = error?.message ? String(error.message) : undefined
  const hasError = Boolean(errorMessage)

  const registration = register ? register(name, rules) : {}

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-slate-800 mb-1.5"
        >
          {label}
          {rest.required && <span className="ml-1 text-red-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-xs">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {leftIcon}
          </div>
        )}

        <select
          id={selectId}
          {...registration}
          {...rest}
          className={cn(
            'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors',
            'focus:outline-none focus:ring-2 appearance-none',
            leftIcon ? 'pl-10' : 'pl-3.5',
            'pr-10',
            hasError
              ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20'
              : 'border-slate-300 hover:border-slate-400 focus:border-emerald-600 focus:ring-emerald-600/20',
            rest.disabled && 'cursor-not-allowed bg-slate-100 text-slate-500 opacity-70',
            className
          )}
        >
          {placeholderOption && (
            <option value="" disabled>
              {placeholderOption}
            </option>
          )}
          {options.map((option) => (
            <option key={String(option.value)} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          {hasError ? (
            <AlertCircle className="h-4 w-4 text-red-500" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.75} aria-hidden="true" />
          )}
        </div>
      </div>

      {hasError ? (
        <p className="flex items-center gap-1 text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1 duration-150">
          <span>{errorMessage}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}

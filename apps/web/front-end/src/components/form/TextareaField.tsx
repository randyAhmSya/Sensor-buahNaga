import type { TextareaHTMLAttributes, ReactNode, ChangeEvent } from 'react'
import { useFormContext, type RegisterOptions } from 'react-hook-form'
import { cn } from '../../utils/cn'

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string
  label?: ReactNode
  helperText?: string
  error?: string
  rules?: RegisterOptions
}

export function TextareaField({
  name,
  label,
  helperText,
  error: errorProp,
  className,
  rules,
  id,
  value,
  defaultValue,
  onChange,
  rows = 3,
  ...rest
}: TextareaFieldProps) {
  const formContext = useFormContext()
  const textareaId = id || `textarea-${name}`

  const register = formContext ? formContext.register : undefined
  const hookFormError = formContext?.formState?.errors?.[name]
  const hookFormErrorMessage = hookFormError?.message ? String(hookFormError.message) : undefined

  const displayError = errorProp || hookFormErrorMessage
  const hasError = Boolean(displayError)

  const registration = register
    ? register(name, rules as RegisterOptions)
    : undefined

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    registration?.onChange?.(e)
    onChange?.(e)
  }

  const valueProps =
    value !== undefined ? { value } : defaultValue !== undefined ? { defaultValue } : {}

  return (
    <div className="w-full space-y-1 text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-semibold text-slate-800 mb-1.5"
        >
          {label}
          {rest.required && <span className="text-red-500 font-bold ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-xs">
        <textarea
          id={textareaId}
          name={name}
          rows={rows}
          {...registration}
          {...rest}
          {...valueProps}
          onChange={handleInputChange}
          className={cn(
            'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors',
            'placeholder:text-slate-400 focus:outline-none focus:ring-1 resize-y',
            hasError
              ? 'border-rose-500 text-rose-900 focus:border-rose-600 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 hover:border-slate-400 focus:border-emerald-600 focus:ring-emerald-600',
            rest.disabled && 'cursor-not-allowed bg-slate-100 text-slate-500 opacity-70',
            className
          )}
        />
      </div>

      {hasError ? (
        <p className="text-xs text-rose-600 font-medium mt-1">{displayError}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}

import type { InputHTMLAttributes, ReactNode, ChangeEvent } from 'react'
import { useFormContext, type RegisterOptions } from 'react-hook-form'
import { cn } from '../../utils/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string
  label?: ReactNode
  description?: string
  error?: string
  rules?: RegisterOptions
}

export function Checkbox({
  name,
  label,
  description,
  error: errorProp,
  className,
  rules,
  id,
  checked,
  defaultChecked,
  onChange,
  ...rest
}: CheckboxProps) {
  const formContext = useFormContext()
  const checkboxId = id || `checkbox-${name}`

  const register = formContext ? formContext.register : undefined
  const hookFormError = formContext?.formState?.errors?.[name]
  const hookFormErrorMessage = hookFormError?.message ? String(hookFormError.message) : undefined

  const displayError = errorProp || hookFormErrorMessage
  const hasError = Boolean(displayError)

  const registration = register
    ? register(name, rules as RegisterOptions)
    : undefined

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    registration?.onChange?.(e)
    onChange?.(e)
  }

  const checkedProps =
    checked !== undefined ? { checked } : defaultChecked !== undefined ? { defaultChecked } : {}

  return (
    <div className="flex flex-col text-left">
      <label htmlFor={checkboxId} className="flex items-start gap-3 cursor-pointer select-none">
        <input
          id={checkboxId}
          name={name}
          type="checkbox"
          {...registration}
          {...rest}
          {...checkedProps}
          onChange={handleInputChange}
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 focus:ring-offset-0 cursor-pointer transition-colors',
            hasError && 'border-rose-500',
            rest.disabled && 'cursor-not-allowed opacity-60',
            className
          )}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-semibold text-slate-800">{label}</span>}
            {description && <span className="text-xs text-slate-600 mt-0.5">{description}</span>}
          </div>
        )}
      </label>

      {hasError && <p className="text-xs text-rose-600 font-medium mt-1 ml-7">{displayError}</p>}
    </div>
  )
}

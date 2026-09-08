import { useState, type InputHTMLAttributes, type ReactNode, type ChangeEvent } from 'react'
import { useFormContext, type RegisterOptions } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: ReactNode
  helperText?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  rules?: RegisterOptions
}

export function InputField({
  name,
  label,
  helperText,
  error: errorProp,
  leftIcon,
  rightIcon,
  className,
  type = 'text',
  rules,
  id,
  value,
  defaultValue,
  onChange,
  ...rest
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const formContext = useFormContext()
  const inputId = id || `input-${name}`

  // If outside FormProvider, fallback gracefully
  const register = formContext ? formContext.register : undefined
  const hookFormError = formContext?.formState?.errors?.[name]
  const hookFormErrorMessage = hookFormError?.message ? String(hookFormError.message) : undefined
  
  const displayError = errorProp || hookFormErrorMessage
  const hasError = Boolean(displayError)

  const registration = register
    ? register(name, {
        ...(type === 'number' ? { valueAsNumber: true } : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(rules as any),
      })
    : undefined

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    registration?.onChange?.(e)
    onChange?.(e)
  }

  const isPasswordType = type === 'password'
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type

  const valueProps =
    value !== undefined ? { value } : defaultValue !== undefined ? { defaultValue } : {}

  return (
    <div className="w-full space-y-1 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
        >
          {label}
          {rest.required && <span className="text-rose-600 font-bold ml-0.5">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-xs">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={inputType}
          {...registration}
          {...rest}
          {...valueProps}
          onChange={handleInputChange}
          className={cn(
            'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors',
            'placeholder:text-slate-400 focus:outline-none focus:ring-1',
            leftIcon ? 'pl-10' : 'pl-4',
            isPasswordType || rightIcon ? 'pr-11' : 'pr-4',
            hasError
              ? 'border-rose-500 text-rose-900 focus:border-rose-600 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 hover:border-slate-400 focus:border-emerald-600 focus:ring-emerald-600',
            rest.disabled && 'cursor-not-allowed bg-slate-100 text-slate-500 opacity-70',
            className
          )}
        />

        {isPasswordType ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : rightIcon ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {hasError ? (
        <p className="text-xs text-rose-600 font-medium mt-1">{displayError}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}

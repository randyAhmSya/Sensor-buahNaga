import type { ReactNode } from 'react'
import {
  FormProvider,
  type UseFormReturn,
  type FieldValues,
  type SubmitHandler,
} from 'react-hook-form'
import { cn } from '../../utils/cn'

interface FormWrapperProps<TFormValues extends FieldValues> {
  methods: UseFormReturn<TFormValues>
  onSubmit: SubmitHandler<TFormValues>
  children: ReactNode
  className?: string
  id?: string
}

export function FormWrapper<TFormValues extends FieldValues>({
  methods,
  onSubmit,
  children,
  className,
  id,
}: FormWrapperProps<TFormValues>) {
  return (
    <FormProvider {...methods}>
      <form
        id={id}
        onSubmit={methods.handleSubmit(onSubmit)}
        className={cn('space-y-4', className)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  )
}

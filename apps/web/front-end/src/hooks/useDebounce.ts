import { useState, useEffect } from 'react'

/**
 * Generic debounce hook.
 * Delay default adalah 350ms (responsif & ramah beban komputasi).
 * Timer di-reset setiap kali nilai `value` berubah sebelum durasi `delay` tercapai.
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce

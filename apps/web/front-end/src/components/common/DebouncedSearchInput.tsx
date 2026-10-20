import { useState, useEffect, useRef, useId, type FC, type ChangeEvent } from 'react'
import { Search, X } from 'lucide-react'

export interface DebouncedSearchInputProps {
  value?: string
  onDebouncedChange: (debouncedValue: string) => void
  delay?: number // default: 1000 (1 detik)
  placeholder?: string
  className?: string
  ariaLabel?: string
  id?: string
}

export const DebouncedSearchInput: FC<DebouncedSearchInputProps> = ({
  value,
  onDebouncedChange,
  delay = 1000,
  placeholder = 'Cari...',
  className = '',
  ariaLabel,
  id,
}) => {
  const generatedId = useId()
  const inputId = id || `search-input-${generatedId}`
  const resolvedAriaLabel = ariaLabel || placeholder || 'Kolom pencarian'

  const [localValue, setLocalValue] = useState<string>(value ?? '')
  const callbackRef = useRef(onDebouncedChange)
  const isFirstRender = useRef(true)
  const lastEmittedValueRef = useRef<string>(value ?? '')

  // Simpan callback terbaru agar dependency useEffect tidak memicu re-triggering berulang
  useEffect(() => {
    callbackRef.current = onDebouncedChange
  }, [onDebouncedChange])

  // Sinkronisasi nilai jika parent mereset atau mengubah prop value secara eksternal
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue((prev) => {
        if (prev !== value) {
          lastEmittedValueRef.current = value
          return value
        }
        return prev
      })
    }
  }, [value])

  // Debounce timer internal
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const handler = setTimeout(() => {
      if (localValue !== lastEmittedValueRef.current) {
        lastEmittedValueRef.current = localValue
        callbackRef.current(localValue)
      }
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [localValue, delay])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }

  const handleClear = () => {
    setLocalValue('')
    lastEmittedValueRef.current = ''
    callbackRef.current('')
  }

  return (
    <div
      className={`relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 transition-all focus-within:bg-white focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 ${className}`}
    >
      <Search
        className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none mr-2"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <input
        id={inputId}
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={resolvedAriaLabel}
        className="w-full text-xs text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
      />
      {localValue.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Hapus kata kunci pencarian"
          title="Hapus pencarian"
          className="p-1 -mr-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}

export default DebouncedSearchInput

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface BlockFilterDropdownProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
}

const FILTER_OPTIONS = ['Semua Blok', 'Sensor Aktif', 'Belum Terpasang']

export const BlockFilterDropdown: React.FC<BlockFilterDropdownProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
      >
        <span>{currentFilter}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onFilterChange(option)
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
            >
              <span>{option}</span>
              {currentFilter === option && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

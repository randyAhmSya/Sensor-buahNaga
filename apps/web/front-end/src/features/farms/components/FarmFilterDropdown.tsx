import React, { useState, useRef, useEffect } from 'react'
import { Filter, ChevronDown, Check } from 'lucide-react'
import type { FarmItem } from '../types/farmTypes'

interface FarmFilterDropdownProps {
  farms: FarmItem[]
  selectedFarmId: string
  onSelectFarm: (id: string) => void
}

export const FarmFilterDropdown: React.FC<FarmFilterDropdownProps> = ({
  farms,
  selectedFarmId,
  onSelectFarm,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || farms[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Filter className="w-4 h-4 text-emerald-700 shrink-0" />
        <span className="max-w-[180px] truncate">{selectedFarm?.name || 'Pilih Kebun'}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white border border-slate-200 p-2 shadow-lg ring-1 ring-black/5 z-20 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Pilih Lokasi Kebun
          </div>
          <div className="space-y-1">
            {farms.map((farm) => {
              const isCurrent = farm.id === selectedFarmId
              return (
                <button
                  key={farm.id}
                  type="button"
                  onClick={() => {
                    onSelectFarm(farm.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{farm.name}</p>
                    <p className="text-xs text-slate-400 font-normal truncate">
                      {farm.location} &bull; {farm.totalBlocks} Blok
                    </p>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

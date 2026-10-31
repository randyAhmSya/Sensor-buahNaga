import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type FC,
} from 'react'

export interface SaasContextValue {
  isSaasEnabled: boolean
  toggleSaasMode: () => void
  setSaasEnabled: (val: boolean) => void
}

const SAAS_STORAGE_KEY = 'agrolight_fitur_langganan_override'

const SaasContext = createContext<SaasContextValue | null>(null)

export const SaasProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isSaasEnabled, setIsSaasEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false

    const stored = localStorage.getItem(SAAS_STORAGE_KEY)
    if (stored !== null) {
      return stored === 'true'
    }

    return import.meta.env.VITE_FITUR_LANGGANAN === 'true'
  })

  // Sinkronisasi state saat localStorage diubah di tab lain
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SAAS_STORAGE_KEY && e.newValue !== null) {
        setIsSaasEnabledState(e.newValue === 'true')
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const setSaasEnabled = useCallback((val: boolean) => {
    setIsSaasEnabledState(val)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SAAS_STORAGE_KEY, String(val))
    }
  }, [])

  const toggleSaasMode = useCallback(() => {
    setIsSaasEnabledState((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem(SAAS_STORAGE_KEY, String(next))
      }
      return next
    })
  }, [])

  return (
    <SaasContext.Provider value={{ isSaasEnabled, toggleSaasMode, setSaasEnabled }}>
      {children}
    </SaasContext.Provider>
  )
}

export function useSaasMode(): SaasContextValue {
  const context = useContext(SaasContext)
  if (!context) {
    throw new Error('useSaasMode must be used within a SaasProvider')
  }
  return context
}


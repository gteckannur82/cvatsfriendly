import { createContext, useContext, type ReactNode } from 'react'

/**
 * Lets the shared editor components run inside the logged-out builder. Returns
 * true when the action may proceed; the anonymous builder returns false and
 * prompts for an account instead.
 */
type Gate = () => boolean

const GateContext = createContext<Gate>(() => true)

export function AccountGateProvider({ gate, children }: { gate: Gate; children: ReactNode }) {
  return <GateContext.Provider value={gate}>{children}</GateContext.Provider>
}

export const useAccountGate = () => useContext(GateContext)

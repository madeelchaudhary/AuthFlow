'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AuthFlow from '../auth-flow'
import * as React from 'react'

interface Session {
  /**
   * The current status of the user's session.
   *
   * If the session is still loading, this will be `"loading"`.
   * If the user is authenticated, this will be `"authenticated"`.
   * If the user is not authenticated, this will be `"unauthenticated"`.
   *
   */
  status: 'loading' | 'authenticated' | 'unauthenticated'

  /**
   * The user's session data.
   *
   * If the user is not authenticated, this will be `null`.
   * If the session is still loading, this will be `undefined`.
   * Otherwise, this will be an object containing the user's session data.
   *
   * @remarks
   * Wrapping components in a `SessionProvider` will provide the session data to all children components.
   *
   */
  data: undefined | null | Awaited<ReturnType<AuthFlow['session']>>['data']
}

const SessionContext = createContext<Session>({
  status: 'loading',
  data: undefined,
})

/**
 * A provider for the user's session.
 *
 * This provider should wrap all components that need access to the user's session.
 *
 * @example
 * ```tsx
 * import { SessionProvider } from "@/lib/react";
 *
 * export default function Layout() {
 *   return (
 *     <SessionProvider>
 *       {/* All components that need access to the user's session *}
 *     </SessionProvider>
 *   );
 * }
 * ```
 */
export function SessionProvider({
  children,
  session,
  sessionTimeout,
}: {
  children: ReactNode
  session: AuthFlow['session']
  sessionTimeout?: number
}) {
  const [status, setStatus] = useState<Session['status']>('loading')
  const [data, setData] = useState<Session['data']>(undefined)
  const timeout = sessionTimeout || 1000 * 60 * 5 // 5 minutes

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fetchData = async () => {
      const res = await session()

      if (res.status === 'error') {
        setStatus('unauthenticated')
        setData(null)
        return
      }

      setStatus('authenticated')
      setData(res.data)
    }

    const sessionIdleInterval = setInterval(fetchData, timeout)

    fetchData()

    return () => clearInterval(sessionIdleInterval)
  }, [session, router, pathname, timeout])

  return <SessionContext.Provider value={{ status, data }}>{children}</SessionContext.Provider>
}

/**
 * A hook to access the user's session.
 *
 * This hook should be used in components that need access to the user's session.
 *
 * @example
 * ```tsx
 * import { useSession } from "@/lib/react";
 *
 * export default function Profile() {
 *   const { status, data } = useSession();
 *
 *   if (status === "loading") {
 *     return <p>Loading...</p>;
 *   }
 *
 *   if (status === "unauthenticated") {
 *     return <p>You are not authenticated.</p>;
 *   }
 *
 *   return <p>Welcome, {data?.name}!</p>;
 * }
 * ```
 */
export const useSession = () => useContext(SessionContext)

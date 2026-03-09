'use client'
// import { useSession, signIn, signOut } from 'next-auth/react'

type AuthUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export function useAuth() {
  // --- 🔴 DÉBUT HACK DEV : On désactive NextAuth temporairement ---
  // const { data: session, status } = useSession()
  // const rawUser = session?.user as AuthUser | undefined

  // Faux utilisateur pour débloquer l'interface
  const mockUser: AuthUser = {
    id: 'dev-user-123',
    name: 'Admin Dev',
    email: 'dev@oprimus.local',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev'
  }

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true, // 🟢 Force l'application à te croire connecté
    userId: mockUser.id,
    signIn: (provider: 'google' | 'github' = 'google') => { window.location.href = '/dashboard' },
    signOut: () => { window.location.href = '/' },
  }
  // --- 🔴 FIN HACK DEV ---
}
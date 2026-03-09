import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { supabaseAdmin } from '@/lib/supabase'
import { resetQuota } from '@/lib/quota'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const { error } = await supabaseAdmin
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.name ?? '',
          avatar_url: user.image ?? '',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
      if (error) {
        console.error('[Auth] Upsert user échoué:', error.message)
        return false
      }
      return true
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub
      }
      return session
    },

    async jwt({ token, user }) {
      if (user) token.sub = user.id
      return token
    },
  },

  events: {
    async createUser({ user }) {
      if (user.id) await resetQuota(user.id, 'starter')
    },
  },

  pages: {
    signIn: '/auth',
    error: '/auth',
  },

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
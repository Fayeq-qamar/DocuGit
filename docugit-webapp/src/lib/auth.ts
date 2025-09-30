import { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { supabaseAdmin } from "./supabase"
import { v4 as uuidv4 } from 'uuid'

export const authOptions: NextAuthOptions = {
  // Temporarily use JWT instead of database sessions due to adapter compatibility
  // adapter: SupabaseAdapter(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.SUPABASE_SERVICE_ROLE_KEY!
  // ),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and user info
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      if (profile) {
        token.githubId = profile.id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          id: token.sub,
          githubId: token.githubId,
        },
      }
    },
    async signIn({ user, account, profile }) {
      // Handle GitHub sign-in and store user data manually
      if (account?.provider === "github" && profile) {
        try {
          console.log('GitHub sign-in successful:', profile.login)

          // Check if user already exists by GitHub ID
          const { data: existingUser } = await supabaseAdmin
            .from('user_profiles')
            .select('user_id')
            .eq('github_id', String(profile.id))
            .single()

          // Use existing user ID or generate new UUID
          const userId = existingUser?.user_id || uuidv4()

          // Store/update user in users table
          const { error: userError } = await supabaseAdmin
            .from('users')
            .upsert({
              id: userId,
              name: profile.name || profile.login,
              email: profile.email,
              image: profile.avatar_url,
            }, {
              onConflict: 'id',
            })

          if (userError) {
            console.error('Error creating/updating user:', userError)
          }

          // Store/update account info
          const { error: accountError } = await supabaseAdmin
            .from('accounts')
            .upsert({
              userId: userId,
              type: account.type,
              provider: account.provider,
              providerAccountId: String(profile.id),
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            }, {
              onConflict: 'provider,providerAccountId',
            })

          if (accountError) {
            console.error('Error creating/updating account:', accountError)
          }

          // Store/update user profile
          const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .upsert({
              user_id: userId,
              github_id: String(profile.id),
              github_username: profile.login,
              avatar_url: profile.avatar_url,
              last_login: new Date().toISOString(),
            }, {
              onConflict: 'user_id',
            })

          if (profileError) {
            console.error('Error creating/updating user profile:', profileError)
          }

          console.log('✅ User data stored in Supabase for:', profile.login)
          return true
        } catch (error) {
          console.error('SignIn callback error:', error)
          return true // Don't block sign-in if Supabase fails
        }
      }
      return true
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
}
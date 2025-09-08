import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface User {
    role?: string
  }
  
  interface Session {
    user: {
      role?: string
    } & DefaultSession["user"]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Check admin credentials from environment
          const adminUsername = process.env.ADMIN_USERNAME
          const adminPassword = process.env.ADMIN_PASSWORD
          
          if (credentials.username === adminUsername && adminPassword) {
            // For now, do simple string comparison since your admin password might not be hashed
            const isValid = credentials.password === adminPassword || 
                           await bcrypt.compare(credentials.password, adminPassword)
            
            if (isValid) {
              return {
                id: "admin",
                name: "Administrator",
                email: "admin@vgbf.se",
                role: "admin"
              }
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role
      }
      return token
    },
    
    async session({ session, token }) {
      if (token?.role && session.user) {
        (session.user as any).role = token.role as string
      }
      return session
    }
  },
  
  pages: {
    signIn: '/auth/signin',
  },
  
  session: {
    strategy: "jwt"
  },
  
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
})

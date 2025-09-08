import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to admin routes only for users with admin role
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "admin"
        }
        
        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Protect admin routes
    "/admin/:path*",
    // Exclude API auth routes from middleware
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ]
}

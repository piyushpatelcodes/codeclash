import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleAccessMap: Record<string, string[]> = {
  superadmin: ["/superadmindashboard", "/upload"],
  admin: ["/upload", "/admin", ],
  finance: ["/upload", "/finance", ],
  labtester: ["/labtester","/upload" ],
  sales: ["/sales","/upload", "/api"],
};

export default withAuth(
  function middleware(req) {
    // Redirect root path to /dashboard
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow auth-related paths
        if (
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname === "/" ||
          pathname.startsWith("/api/video") ||
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/api/users") ||
          pathname.startsWith("/api/report") ||
          pathname.startsWith("/api/imagekit-auth")
        ) {
          return true;
        }

        if (!token) {
          return false;
        }
       

        // // Role-based access control
        // if (pathname.startsWith("/superadmindashboard")) {

        //     return token.role === "superadmin"; // Only superadmin can access
        // }

        // if (pathname.startsWith("/upload")) {
        //     return token.role === "admin" || token.role === "superadmin"; // Admin and superadmin can access
        // }

        // if(pathname.startsWith("/labtester")){
        //     return token.role === "labtester";
        // }

        // if(pathname.startsWith("/sales")){
        //     return token.role === "sales";
        // }

        // // Default: Allow access to other routes for all authenticated users
        // return true;

        // Above commented code is re-written as this for efficency & scalability

        const role = token.role as string;
        const allowedPrefixes = roleAccessMap[role] || [];

        // Match route against allowed prefixes for the user's role
        const hasAccess = allowedPrefixes.some(
          (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
        );

        return hasAccess 
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};

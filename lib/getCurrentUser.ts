import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// Define a type-safe return type for the session user
export type SessionUser = {
  id: string;
  email: string;
  role: "superadmin" | "admin" | "labtester" | "sales" | "finance";
  domain: string;
  domainOwner: boolean;
  authority: string;
  accountStatus: "active" | "suspended" | "pending";
};

/**
 * Helper to get the currently authenticated user from session
 * Throws if session is missing or invalid
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !session.user.id || !session.user.role) {
    throw new Error("Unauthorized: Invalid session");
  }

  return session.user as SessionUser;
}

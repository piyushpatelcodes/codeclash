// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "superadmin" | "admin" | "labtester" | "sales" | "finance";
      authority: string | null;
      domain: string;
      domainOwner: boolean;
      accountStatus: "active" | "suspended" | "pending" ;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "superadmin" | "admin" | "labtester" | "sales" | "finance";
    authority: string | null;
    domain: string;
    domainOwner: boolean;
    accountStatus: "active" | "suspended" | "pending";
  }
}

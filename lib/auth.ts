import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db";
import UserModel from "../models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                try {
                    await connectToDatabase();
                    const user = await UserModel.findOne({ email: credentials.email });

                    console.log("🚀 ~ authorize ~ user authoptions:", user)
                    if (!user) {
                        throw new Error("No user found with this email");
                    }

                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isValid) {
                        throw new Error("Invalid password");
                    }

                    // Return the user object with the required properties
                    return {
                        id: user._id?.toString(),
                        name:  user.email.split("@")[0],
                        email: user.email,
                        role: user.role || "sales", // Add the role property
                        authority: user.authority?.toString() || null,
                        domainOwner: user.domainOwner,
                        domain: user.domain,
                        accountStatus: user.accountStatus,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    throw error;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            console.log("🚀 ~ jwt token callback ~ user:", user)
            console.log("🚀 ~ jwt ~ token authoptions:", token)
            if (user) {
                token.id = user.id;
                token.role = user.role; // Include the role in the JWT
                token.domain = user.domain;
                token.domainOwner = user.domainOwner;
                token.authority = user.authority;
                token.accountStatus = user.accountStatus;
            }
            
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "superadmin" | "admin" | "labtester" | "sales" | "finance"; // Include the role in the session
                session.user.domain = token.domain as string;
                session.user.domainOwner = token.domainOwner as boolean;
                session.user.authority = token.authority as string;
                session.user.accountStatus = token.accountStatus as "active" | "suspended" | "pending";
            }
            console.log("🚀 ~ session ~ session:", session)
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
};
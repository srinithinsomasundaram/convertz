import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { sendWelcomeEmail } from "@/lib/email";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";


export const { handlers, signIn, signOut, auth } = NextAuth(async (req) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Diagnostics for production logs
  if (process.env.NODE_ENV === "production") {
    console.log("[Auth-Diagnostic] Request initialization:", {
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasAuthUrl: !!process.env.AUTH_URL || !!process.env.NEXTAUTH_URL,
      url: req?.url,
    });
  }

  const adapter = (supabaseUrl && supabaseSecret) 
    ? SupabaseAdapter({
        url: supabaseUrl,
        secret: supabaseSecret,
      })
    : undefined;

  return {
    secret: process.env.AUTH_SECRET,
    adapter,
    session: { strategy: "jwt" },
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "you@example.com" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          const supabase = createSupabaseServerClient();
          const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email as string)
            .maybeSingle();

          if (!user || !user.password_hash) return null;

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password as string,
            user.password_hash
          );

          if (!isPasswordCorrect) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }
      }),
      // Add Google Provider only if credentials exist
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? [
            GoogleProvider({
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            }),
          ]
        : []),
    ],
    trustHost: true,
    basePath: "/api/auth",
    pages: {
      signIn: "/login",
    },
    callbacks: {
      jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
    events: {
      async createUser({ user }) {
        if (user.email) {
          await sendWelcomeEmail(user.email, user.name || "");
        }
      },
    },
  };
});

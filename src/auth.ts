import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { sendWelcomeEmail } from "@/lib/email";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validation for core environment variables in production
if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  console.warn("WARNING: AUTH_SECRET is missing. This will cause a Configuration error in Auth.js v5.");
}

// Only initialize adapter if we have the credentials
const adapter = (supabaseUrl && supabaseSecret) 
  ? SupabaseAdapter({
      url: supabaseUrl,
      secret: supabaseSecret,
    })
  : undefined;

if (!adapter) {
  console.warn("Auth.js: SupabaseAdapter is not initialized because environment variables are missing.");
}

const providers = [
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
  })
];

// Add Google Provider only if credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
} else {
  console.warn("Auth.js: GoogleProvider will be disabled because GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET are missing.");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter,
  session: { strategy: "jwt" },
  providers,
  trustHost: true,

  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email) {
        // Send welcome email for new OAuth signups
        await sendWelcomeEmail(user.email, user.name || "");
      }
    },
  },
});

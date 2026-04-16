import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { sendWelcomeEmail } from "@/lib/email";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";

/**
 * CUSTOM SUPABASE ADAPTER
 * This bypasses the official adapter's hardcoded "next_auth" schema 
 * and uses your existing "public" schema tables.
 */
const customAdapter = {
  async createUser(user: any) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("users")
      .insert({
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified).toISOString() : null,
        image: user.image,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async getUser(id: string) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async getUserByEmail(email: string) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async getUserByAccount({ providerAccountId, provider }: any) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("accounts")
      .select("users (*)")
      .match({ provider, providerAccountId })
      .maybeSingle();
    if (error) throw error;
    if (!data || !data.users) return null;
    return data.users;
  },
  async updateUser(user: any) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("users")
      .update({
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified).toISOString() : null,
        image: user.image,
      })
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async linkAccount(account: any) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("accounts").insert({
      userId: account.userId,
      type: account.type,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      refresh_token: account.refresh_token,
      access_token: account.access_token,
      expires_at: account.expires_at,
      token_type: account.token_type,
      scope: account.scope,
      id_token: account.id_token,
      session_state: account.session_state,
    });
    if (error) throw error;
  },
  async createSession({ sessionToken, userId, expires }: any) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("sessions")
      .insert({ sessionToken, userId, expires: expires.toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async getSessionAndUser(sessionToken: string) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("*, users(*)")
      .eq("sessionToken", sessionToken)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const { users: user, ...session } = data;
    return { user, session };
  },
  async updateSession(session: any) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("sessions")
      .update({
        expires: session.expires?.toISOString(),
      })
      .eq("sessionToken", session.sessionToken)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteSession(sessionToken: string) {
    const supabase = createSupabaseServerClient();
    await supabase.from("sessions").delete().eq("sessionToken", sessionToken);
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  // @ts-ignore - Using custom adapter to bypass "next_auth" schema constraint
  adapter: customAdapter,
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

        if (!user.emailVerified) {
          throw new Error("unverified");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  debug: true,
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
      // For Google/OAuth users, we can mark them as verified immediately
      // if the provider confirms it. Google does.
      // For manual signup, we handle the verification email in the register API.
    },
  },
});

import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";
import { isAdminEmail } from "./admin";
import { assertAuthConfig, getAuthUrl } from "./auth";
import { getUserIdByEmail } from "./db/users";

function buildAuthOptions() {
  const authUrl = getAuthUrl();

  if (!process.env.MONGODB_URI) {
    console.warn("[NextAuth] MONGODB_URI is not set — MongoDB adapter disabled.");
  }

  const options = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "select_account",
            access_type: "offline",
            response_type: "code",
          },
        },
      }),
    ],
    adapter: process.env.MONGODB_URI ? MongoDBAdapter(clientPromise) : undefined,
    trustHost: true,
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user?.id) {
          token.id = String(user.id);
        }

        if (!token.id && token.email) {
          const dbUserId = await getUserIdByEmail(token.email);
          if (dbUserId) token.id = dbUserId;
        }

        const email = user?.email || token?.email;
        if (email) {
          token.isAdmin = isAdminEmail(email);
        }

        return token;
      },
      async session({ session, token }) {
        if (session?.user) {
          session.user.id = token.id ? String(token.id) : null;
          session.user.isAdmin = Boolean(token.isAdmin);
        }
        return session;
      },
      async redirect({ url, baseUrl }) {
        const safeBase = authUrl || baseUrl;
        if (url.startsWith("/")) return `${safeBase}${url}`;
        if (url.startsWith(safeBase)) return url;
        return safeBase;
      },
    },
    pages: {
      error: "/auth/error",
    },
    debug: process.env.NODE_ENV === "development",
  };

  return options;
}

try {
  if (process.env.NODE_ENV === "production") {
    assertAuthConfig();
    if (!process.env.MONGODB_URI) {
      console.error("[NextAuth] MONGODB_URI is required in production.");
    }
  }
} catch (error) {
  console.error("[NextAuth]", error.message);
}

export const authOptions = buildAuthOptions();

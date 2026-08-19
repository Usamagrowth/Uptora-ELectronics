import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";

/**
 * Server-side route protection utility
 * Use this in API routes and getServerSideProps to protect routes
 */
export async function requireAuth(req, res) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  
  return { session };
}

export async function requireAdmin(req, res) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  
  if (!session.user.isAdmin) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  
  return { session };
}
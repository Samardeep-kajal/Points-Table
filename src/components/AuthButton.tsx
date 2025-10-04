"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  console.log(
    "AuthButton rendering, session status:",
    status,
    "session:",
    session
  );

  if (status === "loading") {
    return <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm">{session.user?.name}</span>
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-lg shadow-sm transition-colors"
    >
      Sign in with Google
    </button>
  );
}

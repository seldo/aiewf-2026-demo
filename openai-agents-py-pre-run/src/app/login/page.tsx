"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">
            Wonder Toys
          </h1>
          <p className="text-gray-600">
            Your AI-powered toy shopping assistant
          </p>
        </div>

        <div className="mb-6">
          <div className="text-6xl mb-4">🧸</div>
          <p className="text-sm text-gray-500">
            Sign in to start shopping for the perfect toys
          </p>
        </div>

        <button
          onClick={() => signIn("credentials", { callbackUrl: "/" })}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          Enter the store (demo)
        </button>

        <p className="mt-4 text-xs text-gray-400">
          Insecure local demo — no real login required.
        </p>
      </div>
    </div>
  );
}

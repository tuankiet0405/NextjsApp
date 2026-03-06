"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithCredentials } from "../_lib/action";

function SignInForm() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const formData = new FormData(e.target);

        try {
            const result = await signInWithCredentials(formData);
            if (result?.error) {
                setError(result.error);
            }
        } catch (err) {
            setError("Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md">
            {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-sm text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="signin-email" className="text-primary-200 text-sm">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    id="signin-email"
                    required
                    placeholder="you@example.com"
                    className="px-4 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="signin-password" className="text-primary-200 text-sm">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    id="signin-password"
                    required
                    placeholder="Enter your password"
                    className="px-4 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-500 px-6 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
            >
                {isLoading ? "Signing in..." : "Sign in with email"}
            </button>

            <p className="text-primary-400 text-sm text-center">
                Don&apos;t have an account?{" "}
                <Link
                    href="/signup"
                    className="text-accent-400 hover:text-accent-300 underline"
                >
                    Create one
                </Link>
            </p>
        </form>
    );
}

export default SignInForm;

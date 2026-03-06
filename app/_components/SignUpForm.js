"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpWithCredentials } from "../_lib/action";

function SignUpForm() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const formData = new FormData(e.target);
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");
        const policyAccepted = formData.get("policyAccepted");

        // Client-side validation
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (!policyAccepted) {
            setError("You must accept the privacy policy and terms");
            setIsLoading(false);
            return;
        }

        try {
            const result = await signUpWithCredentials(formData);
            if (result?.error) {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
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
                <label htmlFor="fullName" className="text-primary-200 text-sm">
                    Full Name
                </label>
                <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    placeholder="John Doe"
                    className="px-4 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-primary-200 text-sm">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="you@example.com"
                    className="px-4 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="text-primary-200 text-sm">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="px-4 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-primary-200 text-sm">
                    Confirm Password
                </label>
                <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    required
                    minLength={8}
                    placeholder="Re-enter your password"
                    className="px-4 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
                />
            </div>

            {/* Policy confirmation */}
            <div className="flex items-start gap-3 pt-2">
                <input
                    type="checkbox"
                    name="policyAccepted"
                    id="policyAccepted"
                    className="h-5 w-5 accent-accent-500 cursor-pointer mt-0.5 flex-shrink-0"
                />
                <label
                    htmlFor="policyAccepted"
                    className="text-primary-300 text-sm leading-relaxed cursor-pointer"
                >
                    I agree to the{" "}
                    <a href="#" className="text-accent-400 underline hover:text-accent-300">
                        Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-accent-400 underline hover:text-accent-300">
                        Terms of Service
                    </a>
                    . I understand that my data will be processed in accordance with these
                    policies.
                </label>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-500 px-6 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
            >
                {isLoading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-primary-400 text-sm text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-accent-400 hover:text-accent-300 underline">
                    Sign in
                </Link>
            </p>
        </form>
    );
}

export default SignUpForm;

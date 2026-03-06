import SignInButton from "../_components/SignInButton";
import SignInForm from "../_components/SignInForm";

export const metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-8 mt-10 items-center">
      <h2 className="text-3xl font-semibold">
        Sign in to access your guest area
      </h2>

      {/* Email/Password Sign-in */}
      <SignInForm />

      {/* Divider */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="flex-1 border-t border-primary-700"></div>
        <span className="text-primary-500 text-sm">or continue with</span>
        <div className="flex-1 border-t border-primary-700"></div>
      </div>

      {/* OAuth Buttons */}
      <SignInButton />
    </div>
  );
}


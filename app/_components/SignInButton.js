import Image from "next/image";
import { signInAction, signInWithGitHub } from "../_lib/action";

function SignInButton() {
  return (
    <div className="flex flex-col gap-4">
      <form action={signInAction}>
        <button className="flex items-center gap-6 text-lg border border-primary-300 px-10 py-4 font-medium w-full hover:bg-primary-800 transition-colors">
          <Image
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google logo"
            height="24"
            width="24"
          />
          <span>Continue with Google</span>
        </button>
      </form>
      <form action={signInWithGitHub}>
        <button className="flex items-center gap-6 text-lg border border-primary-300 px-10 py-4 font-medium w-full hover:bg-primary-800 transition-colors">
          <Image
            src="https://authjs.dev/img/providers/github.svg"
            alt="GitHub logo"
            height="24"
            width="24"
          />
          <span>Continue with GitHub</span>
        </button>
      </form>
    </div>
  );
}

export default SignInButton;


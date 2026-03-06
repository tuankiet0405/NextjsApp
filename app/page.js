import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/bg.png";

export default function Page() {
  return (
    <main className="mt-12 md:mt-24">
      <Image src={Logo} fill alt="Moutains and forest with two cabins" />
      <div className="relative z-10 text-center">
        <h1 className="text-5xl md:text-8xl font-normal tracking-tight text-primary-50 mb-6 md:mb-10">
          Welcome to paradise.
        </h1>
        <Link
          href="cabins"
          className="bg-accent-500 px-6 py-4 md:px-8 md:py-6 text-primary-800 font-semibold hover:bg-accent-600 text-lg md:text-xl transition-all"
        >
          Explore luxury cabins
        </Link>
      </div>
    </main>
  );
}


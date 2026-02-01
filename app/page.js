import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/bg.png";

export default function Page() {
  return (
    <main className="mt-24 ">
      <Image src={Logo} fill alt="Moutains and forest with two cabins" />
      <div className="relative z-10 text-center">
        <h1 className="text-8xl font-normal tracking-tight text-primary-50 mb-10">
          Welcome to paradise.
        </h1>
        <Link
          href="cabins"
          className="bg-accent-500 px-8 py-6 text-primary-800 font-semibold hover:bg-accent-600 text-xl transition-all"
        >
          Explore luxury cabins
        </Link>
      </div>
    </main>
  );
}

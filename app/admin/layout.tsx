import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/_lib/auth";

export const metadata = { title: "Admin Dashboard" };

const adminNavLinks = [
  { name: "Overview", href: "/admin" },
  { name: "Cabins", href: "/admin/cabins" },
  { name: "Bookings", href: "/admin/bookings" },
  { name: "Guests", href: "/admin/guests" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/account");

  return (
    <div>
      <div className="flex items-center justify-between mb-8 border-b border-primary-800 pb-4">
        <h1 className="text-2xl font-semibold text-accent-400">Admin Dashboard</h1>
        <nav className="flex gap-1">
          {adminNavLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-4 py-2 text-sm text-primary-300 hover:bg-primary-800 hover:text-primary-100 transition-colors rounded-sm"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}

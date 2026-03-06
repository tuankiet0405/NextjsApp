import Link from "next/link";
import { auth } from "@/app/_lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Admin Dashboard",
};

const adminNavLinks = [
    { name: "Overview", href: "/admin" },
    { name: "Cabins", href: "/admin/cabins" },
    { name: "Bookings", href: "/admin/bookings" },
    { name: "Guests", href: "/admin/guests" },
];

export default async function AdminLayout({ children }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    // TODO: Add admin role check when role column is added to guests table
    // const isAdmin = session.user.role === "admin";
    // if (!isAdmin) redirect("/account");

    return (
        <div>
            <div className="flex items-center justify-between mb-8 border-b border-primary-800 pb-4">
                <h1 className="text-2xl font-semibold text-accent-400">
                    Admin Dashboard
                </h1>
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

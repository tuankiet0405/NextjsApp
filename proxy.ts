export { auth as proxy } from "@/app/_lib/auth";

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};

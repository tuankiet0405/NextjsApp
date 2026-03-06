const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://the-wild-oasis.com";

export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/account", "/api"],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}

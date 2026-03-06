import { getCabins } from "./_lib/data-service";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://the-wild-oasis.com";

export default async function sitemap() {
    const cabins = await getCabins();

    const cabinUrls = cabins.map((cabin) => ({
        url: `${BASE_URL}/cabins/${cabin.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/cabins`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        ...cabinUrls,
    ];
}

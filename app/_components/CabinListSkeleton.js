function CabinCardSkeleton() {
    return (
        <div className="flex border-primary-800 border animate-pulse">
            <div className="flex-1 relative bg-primary-800 min-h-[200px]" />
            <div className="flex-grow">
                <div className="pt-5 pb-4 px-7 bg-primary-950 space-y-3">
                    <div className="h-7 bg-primary-800 rounded w-3/4" />
                    <div className="h-5 bg-primary-800 rounded w-1/2" />
                    <div className="h-8 bg-primary-800 rounded w-2/5 ml-auto" />
                </div>
                <div className="bg-primary-950 border-t border-t-primary-800 text-right">
                    <div className="py-4 px-6 inline-block">
                        <div className="h-5 bg-primary-800 rounded w-40" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CabinListSkeleton() {
    return (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
            {Array.from({ length: 4 }, (_, i) => (
                <CabinCardSkeleton key={i} />
            ))}
        </div>
    );
}

import { useQuery } from "@tanstack/react-query";
export function useAdminQuery(queryKey, url) {
    return useQuery({
        queryKey: [queryKey],
        queryFn: async () => {
            const res = await fetch(url);
            if (!res.ok)
                throw new Error(`Failed to fetch ${queryKey}`);
            return await res.json();
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });
}

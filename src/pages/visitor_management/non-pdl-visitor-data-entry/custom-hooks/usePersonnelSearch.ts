/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { PERSONNEL } from "@/lib/urls";

const PAGE_SIZE = 10; // Adjust if your backend uses a different page size

const usePersonnelSearch = (token: string) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [offset, setOffset] = useState(0);
  const [allPersonnel, setAllPersonnel] = useState<any[]>([]);
  const prevSearchTerm = useRef("");

  const {
    data: personnel,
    isLoading: personnelLoading,
    isFetching,
  } = useQuery({
    queryKey: ["non-pdl", "personnel", searchTerm, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: PAGE_SIZE.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const url = `${PERSONNEL.getPersonnel}?${params}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch Personnel data.");
      }

      const data = await res.json();
      return data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (personnel?.results) {
      if (searchTerm !== prevSearchTerm.current) {
        setAllPersonnel(personnel.results);
        prevSearchTerm.current = searchTerm;
      } else if (offset === 0) {
        setAllPersonnel(personnel.results);
      } else {
        setAllPersonnel((prev) => {
          const existingIds = new Set(prev.map((item: any) => item.id));
          const newItems = personnel.results.filter(
            (item: any) => !existingIds.has(item.id)
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [personnel, searchTerm, offset]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setOffset(0);
      }, 300),
    []
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  const loadMore = () => {
    if (personnel?.next && !isFetching) {
      setOffset((prev) => prev + PAGE_SIZE);
    }
  };

  return {
    personnel: allPersonnel,
    personnelLoading: personnelLoading && offset === 0,
    isFetching,
    hasMore: !!personnel?.next,
    handleSearch,
    loadMore,
  };
};

export default usePersonnelSearch;

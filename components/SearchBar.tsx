"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Construction de l'URL de recherche
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <input
        type="text"
        placeholder="Rechercher un emploi..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-full rounded-full py-3 px-6 bg-white text-black focus:outline-none placeholder:text-gray-500"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#1a5a8e] hover:bg-[#0f4d7d] text-white p-2 rounded-full transition-all"
      >
        <Search size={20} />
      </button>
    </form>
  );
}

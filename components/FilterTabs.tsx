"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const filters = [
  { id: "all", label: "Tous" },
  { id: "cdi", label: "CDI" },
  { id: "cdd", label: "CDD" },
  { id: "stage", label: "Stage" },
  { id: "freelance", label: "Freelance" },
];

export default function FilterTabs() {
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);

    if (filterId === "all") {
      router.push("/jobs");
    } else {
      router.push(`/jobs?contract_type=${filterId}`);
    }
  };

  return (
    <div className="flex justify-center space-x-6 md:space-x-8 mt-6 fade-in">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleFilterClick(filter.id)}
          className={`relative text-sm md:text-base font-medium transition-all duration-300 pb-2 ${
            activeFilter === filter.id
              ? "text-white"
              : "text-white/70 hover:text-white/90"
          }`}
        >
          {filter.label}
          {activeFilter === filter.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"></span>
          )}
        </button>
      ))}
    </div>
  );
}

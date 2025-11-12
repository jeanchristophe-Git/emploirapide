"use client";

import { ChevronLeft, ChevronRight, Code, ShoppingCart, Calculator, Users, Megaphone, Wrench } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const categories = [
  {
    id: 1,
    title: "Informatique & Tech",
    count: "245 offres",
    icon: Code,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "Commerce & Vente",
    count: "189 offres",
    icon: ShoppingCart,
    gradient: "from-green-500 to-green-600",
  },
  {
    id: 3,
    title: "Comptabilité & Finance",
    count: "156 offres",
    icon: Calculator,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: 4,
    title: "Ressources Humaines",
    count: "98 offres",
    icon: Users,
    gradient: "from-purple-500 to-purple-600",
  },
  {
    id: 5,
    title: "Marketing & Communication",
    count: "167 offres",
    icon: Megaphone,
    gradient: "from-pink-500 to-pink-600",
  },
  {
    id: 6,
    title: "Ingénierie & Technique",
    count: "134 offres",
    icon: Wrench,
    gradient: "from-red-500 to-red-600",
  },
];

export default function JobCategoryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, categories.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="relative fade-in">
      {/* Flèche gauche */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          aria-label="Précédent"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Carrousel */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
          }}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/jobs?category=${encodeURIComponent(category.title)}`}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / itemsPerPage}%` }}
              >
                <div className="group bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/20">
                  <div className={`h-32 bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                    <Icon className="w-16 h-16 text-white" />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {category.title}
                    </h3>
                    <p className="text-white/70 text-xs">{category.count}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Flèche droite */}
      {currentIndex < maxIndex && (
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          aria-label="Suivant"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

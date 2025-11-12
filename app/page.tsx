"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, ChevronLeft, ChevronRight, Menu, Briefcase, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PublishedJobs from "@/components/PublishedJobs";

export default function Home() {
  const { data: session, update } = useSession();
  const [keyword, setKeyword] = useState("");
  const [selectedContractType, setSelectedContractType] = useState("Tous");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // Rafraîchir la session au chargement de la page
  useEffect(() => {
    if (session && update) {
      update();
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (selectedContractType !== "Tous") params.set("contract_type", selectedContractType);
    router.push(`/search?${params.toString()}`);
  };

  const handleContractTypeFilter = (type: string) => {
    setSelectedContractType(type);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden text-white bg-[radial-gradient(1200px_600px_at_50%_10%,#1a5a8e_0%,#0f4d7d_40%,#0a3d5f_70%,#083449_100%)]">
      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 mx-auto max-w-7xl z-50">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 text-sm">
          <nav className="hidden md:flex items-center space-x-6 text-white/90">
            <Link className="hover:underline" href="/about">À propos</Link>
            <Link className="hover:underline" href="/contact">Contact</Link>
            <Link className="hover:underline" href="/search">Recherche avancée</Link>
          </nav>
          <div className="flex items-center space-x-3 md:space-x-4 ml-auto">
            {session ? (
              <>
                <Link href={session.user.role === "recruiter" ? "/recruiter" : "/candidate"} className="hidden md:inline hover:underline">
                  Mon tableau de bord
                </Link>
                <Link href="/api/auth/signout" className="hidden md:inline hover:underline">
                  Déconnexion
                </Link>
                <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center overflow-hidden hidden md:block">
                  {session.user.profilePhoto ? (
                    <img src={session.user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">👤</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="hidden md:inline hover:underline">Connexion</Link>
                <Link href="/auth/signup" className="hidden md:inline hover:underline">Inscription</Link>
              </>
            )}

            {/* Burger menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a3d5f]/98 backdrop-blur-md border-t border-white/10 mx-4 rounded-b-2xl shadow-xl">
            <nav className="px-6 py-4 space-y-3">
              <Link
                href="/about"
                className="block text-white/90 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link
                href="/contact"
                className="block text-white/90 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/search"
                className="block text-white/90 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Recherche avancée
              </Link>

              {session ? (
                <>
                  <div className="pt-3 border-t border-white/20 space-y-2">
                    <Link
                      href={session.user.role === "recruiter" ? "/recruiter" : "/candidate"}
                      className="block text-white/90 hover:text-white transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mon tableau de bord
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full text-left text-white/90 hover:text-white transition-colors py-2"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="pt-3 border-t border-white/20 space-y-2">
                    <Link
                      href="/auth/signin"
                      className="block text-white/90 hover:text-white transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block bg-secondary hover:bg-secondary/90 text-text font-semibold px-6 py-2 rounded-xl transition-all text-sm text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      S&apos;inscrire
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Center logo + search */}
      <main className="h-full w-full flex flex-col items-center justify-center -mt-6 px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-6 select-none">
          <div className="h-8 w-8 md:h-10 md:w-10 text-emerald-300 drop-shadow grid place-items-center bg-white/10 rounded-lg md:rounded-xl">
            <Briefcase className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">EmploiRapide</span>
        </div>

        {/* Search box */}
        <form onSubmit={handleSearch} className="relative w-full max-w-[720px]">
          <input
            type="text"
            placeholder="Rechercher un emploi..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full h-11 md:h-12 rounded-full pl-5 md:pl-6 pr-12 md:pr-14 text-sm md:text-base text-slate-900 placeholder-slate-500 bg-white/95 shadow-[0_6px_18px_rgba(0,0,0,0.25)] outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 h-8 w-8 md:h-9 md:w-9 grid place-items-center rounded-full bg-[#1a5a8e] hover:bg-[#0f4d7d] active:scale-95 transition"
            aria-label="Search"
          >
            <Search className="h-4 w-4 md:h-4.5 md:w-4.5" />
          </button>
        </form>

        {/* Tabs */}
        <div className="mt-5 md:mt-6 flex items-center gap-4 md:gap-6 text-xs md:text-sm text-white/90 overflow-x-auto pb-2 scrollbar-hide max-w-full">
          {["Tous", "CDI", "CDD", "Stage", "Freelance"].map((tab) => (
            <div key={tab} className="relative flex-shrink-0">
              <button
                onClick={() => handleContractTypeFilter(tab)}
                className="hover:underline whitespace-nowrap px-1"
              >
                {tab}
              </button>
              {tab === selectedContractType && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-white rounded-full" />
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Bottom carousel */}
      <section className="absolute inset-x-0 bottom-16 sm:bottom-20 md:bottom-24">
        <div className="mx-auto max-w-6xl relative">
          {/* Arrows - Hidden on mobile */}
          <button className="hidden md:block absolute -left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur z-10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur z-10">
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Container with padding only on sides */}
          <div className="px-4 md:px-6">
            <PublishedJobs contractTypeFilter={selectedContractType} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute inset-x-0 bottom-2 md:bottom-4 text-[10px] md:text-[11px] text-white/85">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Plus de <strong className="text-white">10,000+</strong> offres disponibles</span>
          </div>
          <p className="opacity-90 hidden md:block">
            EmploiRapide - Votre portail d&apos;emploi en Côte d&apos;Ivoire
          </p>
        </div>
      </footer>
    </div>
  );
}

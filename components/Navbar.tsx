"use client";

import Link from "next/link";
import { Briefcase, User, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="bg-primary/50 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et liens de navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 text-white hover:text-secondary transition-colors"
            >
              <Briefcase className="w-6 h-6" />
              <span className="font-heading font-bold text-xl hidden sm:block">
                EmploiRapide
              </span>
            </Link>

            <div className="hidden md:flex space-x-6 text-sm">
              <Link
                href="/search"
                className="text-white/90 hover:text-white transition-colors"
              >
                Rechercher
              </Link>
              <Link
                href="/cv-analysis"
                className="text-white/90 hover:text-white transition-colors"
              >
                Analyser CV
              </Link>
              <Link
                href="/candidate"
                className="text-white/90 hover:text-white transition-colors"
              >
                Candidat
              </Link>
              <Link
                href="/recruiter"
                className="text-white/90 hover:text-white transition-colors"
              >
                Recruteur
              </Link>
            </div>
          </div>

          {/* Boutons connexion/inscription */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="hidden sm:block text-white/90 text-sm">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden sm:flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="hidden sm:flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">Se connecter</span>
                </Link>

                <Link
                  href="/auth/signup"
                  className="hidden sm:block bg-secondary hover:bg-secondary/90 text-text font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 text-sm"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}

            {/* Menu mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Menu mobile dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-white/20 pt-4">
            <Link
              href="/search"
              className="block text-white/90 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Rechercher
            </Link>
            <Link
              href="/cv-analysis"
              className="block text-white/90 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Analyser CV
            </Link>
            <Link
              href="/candidate"
              className="block text-white/90 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Candidat
            </Link>
            <Link
              href="/recruiter"
              className="block text-white/90 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Recruteur
            </Link>

            {session ? (
              <>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-white/70 text-sm mb-2">
                    Connecté en tant que
                  </p>
                  <p className="text-white font-semibold mb-3">
                    {session.user?.name}
                  </p>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" />
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
                    Se connecter
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
          </div>
        )}
      </div>
    </nav>
  );
}

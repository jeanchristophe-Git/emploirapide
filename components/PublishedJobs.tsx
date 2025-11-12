"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Briefcase, Heart } from "lucide-react";
import Link from "next/link";

// Interface pour typer les données d'une offre d'emploi
interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  description: string;
  salary: string;
  contract_type: string;
  category: string;
  postedAt: string;
  applicationsCount: number;
  isLocal: boolean;
}

interface PublishedJobsProps {
  contractTypeFilter?: string;
}

export default function PublishedJobs({ contractTypeFilter = "Tous" }: PublishedJobsProps) {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  // Charger les jobs et les favoris au montage du composant
  useEffect(() => {
    loadJobs();
    if (session) {
      loadSavedJobs();
    }
  }, [session]);

  // Filtrer les jobs selon le type de contrat sélectionné
  useEffect(() => {
    if (contractTypeFilter === "Tous") {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job =>
        job.contract_type.toLowerCase() === contractTypeFilter.toLowerCase()
      );
      setFilteredJobs(filtered);
    }
  }, [jobs, contractTypeFilter]);

  // Fonction pour charger les offres d'emploi publiées
  const loadJobs = async () => {
    try {
      const res = await fetch("/api/jobs/published?limit=12");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les jobs sauvegardés par l'utilisateur (pour afficher le coeur rempli)
  const loadSavedJobs = async () => {
    try {
      const res = await fetch("/api/saved-jobs");
      if (res.ok) {
        const data = await res.json();
        // Correction TypeScript : typer explicitement le Set comme Set<string>
        const saved = new Set<string>(data.jobs.map((j: any) => String(j.jobId || j.id)));
        setSavedJobs(saved);
      }
    } catch (error) {
      console.error("Error loading saved jobs:", error);
    }
  };

  // Fonction pour sauvegarder ou retirer un job des favoris
  const handleSaveJob = async (job: Job) => {
    // Vérifier si l'utilisateur est connecté
    if (!session) {
      alert("Veuillez vous connecter pour sauvegarder des offres");
      return;
    }

    try {
      if (savedJobs.has(job.id)) {
        // Retirer des favoris
        const res = await fetch(`/api/saved-jobs?jobId=${job.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setSavedJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(job.id);
            return newSet;
          });
        }
      } else {
        // Ajouter aux favoris
        const res = await fetch("/api/saved-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: job.id,
            jobData: job,
          }),
        });
        if (res.ok) {
          setSavedJobs(prev => new Set(prev).add(job.id));
        }
      }
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="text-white/70 mt-4">Chargement des offres...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <p className="text-white/70 text-lg">Aucune offre publiée pour le moment</p>
      </div>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <p className="text-white/70 text-lg">
          Aucune offre {contractTypeFilter !== "Tous" ? `en ${contractTypeFilter}` : ""} pour le moment
        </p>
      </div>
    );
  }

  // Affichage du composant - style Bing avec cartes améliorées
  return (
    <div className="flex items-stretch gap-3 md:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 snap-x snap-mandatory">
      {filteredJobs.map((job) => (
        <article
          key={job.id}
          className="w-36 sm:w-40 md:w-44 shrink-0 rounded-lg overflow-hidden bg-white/10 hover:bg-white/15 transition cursor-pointer relative group snap-start"
        >
          <Link href={`/jobs/${job.id}`}>
            {/* Image/Logo de l'entreprise */}
            <div className="h-16 sm:h-20 md:h-24 w-full overflow-hidden bg-white/20">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/70" />
                </div>
              )}
            </div>

            {/* Titre du poste */}
            <div className="px-2 sm:px-2.5 md:px-3 py-2">
              <p className="text-[9px] sm:text-[10px] md:text-[11px] leading-snug line-clamp-2 break-words">{job.title}</p>
            </div>
          </Link>

          {/* Bouton cœur pour sauvegarder */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaveJob(job);
            }}
            className={`absolute top-1.5 sm:top-2 right-1.5 sm:right-2 p-1 sm:p-1.5 rounded-full transition-all backdrop-blur ${
              savedJobs.has(job.id)
                ? "bg-red-500/80 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Heart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${savedJobs.has(job.id) ? "fill-current" : ""}`} />
          </button>
        </article>
      ))}
    </div>
  );
}

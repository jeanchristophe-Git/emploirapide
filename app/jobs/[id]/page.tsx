"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { MapPin, Briefcase, DollarSign, Building2, Clock, ArrowLeft, Heart, Send } from "lucide-react";
import Link from "next/link";

// Interface pour typer les données d'une offre d'emploi
interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  description: string;
  requirements?: string;
  salary: string;
  salary_min?: number;
  salary_max?: number;
  contract_type: string;
  category: string;
  postedAt: string;
  applicationsCount: number;
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [applying, setApplying] = useState(false);

  // Charger les détails du job
  useEffect(() => {
    if (params.id) {
      loadJobDetails();
      if (session) {
        checkIfSaved();
      }
    }
  }, [params.id, session]);

  // Fonction pour charger les détails du job depuis l'API
  const loadJobDetails = async () => {
    try {
      const res = await fetch(`/api/jobs/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);
      } else {
        console.error("Job not found");
      }
    } catch (error) {
      console.error("Error loading job details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si le job est sauvegardé
  const checkIfSaved = async () => {
    try {
      const res = await fetch("/api/saved-jobs");
      if (res.ok) {
        const data = await res.json();
        const saved = data.jobs.some((j: any) => (j.jobId || j.id) === params.id);
        setIsSaved(saved);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  // Fonction pour sauvegarder/retirer des favoris
  const toggleSave = async () => {
    if (!session) {
      alert("Veuillez vous connecter pour sauvegarder des offres");
      return;
    }

    if (!job) return;

    try {
      if (isSaved) {
        // Retirer des favoris
        const res = await fetch(`/api/saved-jobs?jobId=${job.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsSaved(false);
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
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  // Fonction pour postuler au job
  const handleApply = async () => {
    if (!session) {
      alert("Veuillez vous connecter pour postuler");
      router.push("/auth/signin");
      return;
    }

    setApplying(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job?.id,
        }),
      });

      if (res.ok) {
        alert("Candidature envoyée avec succès !");
        router.push("/candidate");
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'envoi de la candidature");
      }
    } catch (error) {
      console.error("Error applying:", error);
      alert("Erreur lors de l'envoi de la candidature");
    } finally {
      setApplying(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Il y a 1 jour";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? "s" : ""}`;
    return date.toLocaleDateString("fr-FR");
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Si le job n'existe pas
  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-text mb-4">Offre non trouvée</h1>
          <Link href="/" className="text-primary hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // Affichage des détails du job
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Bouton retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-grayDark hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </Link>

        {/* Carte principale */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-grayLight overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-4 md:p-6 lg:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4 mb-4">
              <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover rounded-lg md:rounded-xl" />
                  ) : (
                    <Building2 className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold mb-1 md:mb-2 break-words">{job.title}</h1>
                  <p className="text-base md:text-lg lg:text-xl opacity-90 break-words">{job.company}</p>
                </div>
              </div>
              <button
                onClick={toggleSave}
                className={`self-start p-2 md:p-3 rounded-lg transition-all shrink-0 ${
                  isSaved
                    ? "bg-white/20 text-white"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isSaved ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Informations principales */}
            <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-6 text-xs md:text-sm">
              <div className="flex items-center gap-1.5 md:gap-2">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span className="break-words">{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Briefcase className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span>{job.contract_type}</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span className="whitespace-nowrap">{job.salary}</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span className="whitespace-nowrap">{formatDate(job.postedAt)}</span>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-4 md:p-6 lg:p-8">
            {/* Bouton postuler */}
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg md:rounded-xl transition-all hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6 md:mb-8 text-sm md:text-base"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
              {applying ? "Envoi en cours..." : "Postuler à cette offre"}
            </button>

            {/* Description */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-text mb-3 md:mb-4">Description du poste</h2>
              <p className="text-grayDark text-sm md:text-base leading-relaxed whitespace-pre-line break-words">{job.description}</p>
            </div>

            {/* Exigences */}
            {job.requirements && (
              <div className="mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-text mb-3 md:mb-4">Exigences</h2>
                <p className="text-grayDark text-sm md:text-base leading-relaxed whitespace-pre-line break-words">{job.requirements}</p>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="border-t border-grayLight pt-4 md:pt-6">
              <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-text mb-3 md:mb-4">Informations supplémentaires</h2>
              <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-grayDark text-xs md:text-sm mb-1">Catégorie</p>
                  <p className="text-text font-semibold text-sm md:text-base break-words">{job.category}</p>
                </div>
                <div>
                  <p className="text-grayDark text-xs md:text-sm mb-1">Candidatures reçues</p>
                  <p className="text-text font-semibold text-sm md:text-base">{job.applicationsCount} candidature{job.applicationsCount > 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

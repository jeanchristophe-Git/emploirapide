"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { MapPin, Briefcase, DollarSign, Building2, Clock, ArrowLeft, Heart, ExternalLink, Check } from "lucide-react";
import Link from "next/link";

interface ExternalJob {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  type: string;
  salary: string;
  postedAt: string;
  description: string;
  applyLink: string;
  qualifications?: string[];
  responsibilities?: string[];
}

export default function ExternalJobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [job, setJob] = useState<ExternalJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    // Try to load job from URL params first (when coming from search)
    const jobDataParam = searchParams.get("data");

    if (jobDataParam) {
      try {
        const jobData = JSON.parse(decodeURIComponent(jobDataParam));
        setJob(jobData);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing job data:", error);
        loadJobFromSavedOrApplied();
      }
    } else {
      loadJobFromSavedOrApplied();
    }

    if (session) {
      checkIfSaved();
      checkIfApplied();
    }
  }, [params.id, session]);

  const loadJobFromSavedOrApplied = async () => {
    try {
      // Try to load from saved jobs first
      const savedRes = await fetch("/api/saved-jobs");
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        const savedJob = savedData.jobs.find((j: any) => j.jobId === params.id);

        if (savedJob) {
          setJob({
            id: savedJob.jobId,
            ...savedJob,
          });
          setLoading(false);
          return;
        }
      }

      // Try to load from external applications
      const appsRes = await fetch("/api/applications/external");
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        const appliedJob = appsData.applications.find((j: any) => j.jobId === params.id);

        if (appliedJob) {
          setJob(appliedJob);
          setLoading(false);
          return;
        }
      }

      // If not found, redirect back to search
      console.error("External job not found");
      router.push("/search");
    } catch (error) {
      console.error("Error loading job:", error);
      router.push("/search");
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const res = await fetch("/api/saved-jobs");
      if (res.ok) {
        const data = await res.json();
        const saved = data.jobs.some((j: any) => j.jobId === params.id);
        setIsSaved(saved);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const checkIfApplied = async () => {
    try {
      const res = await fetch("/api/applications/external");
      if (res.ok) {
        const data = await res.json();
        const applied = data.applications.some((j: any) => j.jobId === params.id);
        setHasApplied(applied);
      }
    } catch (error) {
      console.error("Error checking applied status:", error);
    }
  };

  const toggleSave = async () => {
    if (!session) {
      alert("Veuillez vous connecter pour sauvegarder des offres");
      return;
    }

    if (!job) return;

    try {
      if (isSaved) {
        const res = await fetch(`/api/saved-jobs?jobId=${job.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsSaved(false);
        }
      } else {
        const res = await fetch("/api/saved-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: job.id,
            jobData: JSON.stringify(job),
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

  const handleApply = async () => {
    if (!session) {
      alert("Veuillez vous connecter pour postuler");
      router.push("/auth/signin");
      return;
    }

    if (!job) return;

    setApplying(true);
    try {
      const res = await fetch("/api/applications/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          jobData: JSON.stringify(job),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setHasApplied(true);
        alert("Candidature enregistrée avec succès!");

        // Open external apply link
        if (job.applyLink) {
          window.open(job.applyLink, "_blank");
        }
      } else {
        alert(data.error || "Erreur lors de l'enregistrement de la candidature");
      }
    } catch (error) {
      console.error("Error applying:", error);
      alert("Erreur lors de l'enregistrement de la candidature");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-grayDark">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-grayDark mb-4">Offre non trouvée</p>
          <Link href="/search" className="text-primary hover:underline">
            Retour à la recherche
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back button */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-grayDark hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux résultats
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-grayLight p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
          <div className="flex flex-col gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="flex items-start gap-3 md:gap-4 flex-1">
              {job.logo && (
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-lg border border-grayLight shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-text mb-2 break-words">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 md:w-5 md:h-5 text-grayDark shrink-0" />
                    <span className="text-base md:text-lg lg:text-xl font-semibold text-grayDark break-words">{job.company}</span>
                    <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 md:py-1 rounded font-semibold shrink-0">
                      Externe
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-grayDark">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    <span className="break-words">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Briefcase className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    <span>{job.type}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <DollarSign className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                      <span className="whitespace-nowrap">{job.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    <span className="whitespace-nowrap">{job.postedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            {hasApplied ? (
              <div className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-success/10 text-success rounded-lg md:rounded-xl text-sm md:text-base font-semibold flex items-center justify-center gap-2">
                <Check className="w-4 h-4 md:w-5 md:h-5" />
                Candidature enregistrée
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-primary text-white rounded-lg md:rounded-xl text-sm md:text-base font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? "Enregistrement..." : "Postuler maintenant"}
              </button>
            )}
            <button
              onClick={toggleSave}
              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all border flex items-center justify-center gap-2 ${
                isSaved
                  ? "bg-accent/10 text-accent border-accent"
                  : "bg-white text-grayDark border-grayLight hover:border-accent hover:text-accent"
              }`}
            >
              <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isSaved ? "fill-accent" : ""}`} />
              <span className="sm:hidden">Sauvegarder</span>
            </button>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-grayLight p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-text mb-3 md:mb-4">
            Description du poste
          </h2>
          <div className="text-grayDark text-sm md:text-base whitespace-pre-wrap leading-relaxed break-words">
            {job.description}
          </div>
        </div>

        {/* Qualifications */}
        {job.qualifications && job.qualifications.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-grayLight p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-text mb-3 md:mb-4">
              Qualifications requises
            </h2>
            <ul className="space-y-2">
              {job.qualifications.map((qual, index) => (
                <li key={index} className="flex items-start gap-2 text-grayDark text-sm md:text-base">
                  <span className="text-primary mt-1 shrink-0">•</span>
                  <span className="break-words">{qual}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-grayLight p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-text mb-3 md:mb-4">
              Responsabilités
            </h2>
            <ul className="space-y-2">
              {job.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2 text-grayDark text-sm md:text-base">
                  <span className="text-primary mt-1 shrink-0">•</span>
                  <span className="break-words">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Apply Link */}
        {job.applyLink && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-text mb-1">
                Prêt à postuler ?
              </h3>
              <p className="text-sm text-grayDark">
                Cette offre est hébergée sur un site externe
              </p>
            </div>
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              Postuler sur le site
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

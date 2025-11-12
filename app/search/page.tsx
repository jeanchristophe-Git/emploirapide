"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { Search, MapPin, Briefcase, Clock, DollarSign, Building2, Filter, ExternalLink, Loader2, Heart } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedAt: string;
  description: string;
  logo?: string;
  applyLink?: string;
  qualifications?: string[];
  responsibilities?: string[];
  isLocal?: boolean;
}

const name = 'EmploiRapide'

interface data {
  name: string;
}

function SearchPageContent( Data:data) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("Côte d'Ivoire");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Charger les emplois sauvegardés et les candidatures externes
  useEffect(() => {
    if (session) {
      loadSavedJobs();
      loadAppliedJobs();
    }
  }, [session]);

  const loadSavedJobs = async () => {
    try {
      const response = await fetch("/api/saved-jobs");
      if (response.ok) {
        const data = await response.json();
        const ids = data.jobs.map((job: any) => job.jobId);
        setSavedJobIds(ids);
      }
    } catch (error) {
      console.error("Error loading saved jobs:", error);
    }
  };

  const loadAppliedJobs = async () => {
    try {
      const response = await fetch("/api/applications/external");
      if (response.ok) {
        const data = await response.json();
        const ids = data.applications.map((app: any) => app.jobId);
        setAppliedJobIds(ids);
      }
    } catch (error) {
      console.error("Error loading applied jobs:", error);
    }
  };

  const handleToggleSave = async (job: Job) => {
    if (!session) {
      alert("Veuillez vous connecter pour sauvegarder des emplois");
      return;
    }

    const isSaved = savedJobIds.includes(job.id);

    if (isSaved) {
      // Retirer des favoris
      try {
        const response = await fetch(`/api/saved-jobs?jobId=${job.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setSavedJobIds(savedJobIds.filter(id => id !== job.id));
        }
      } catch (error) {
        console.error("Error removing saved job:", error);
      }
    } else {
      // Ajouter aux favoris
      try {
        const response = await fetch("/api/saved-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: job.id,
            jobData: JSON.stringify(job),
          }),
        });

        if (response.ok) {
          setSavedJobIds([...savedJobIds, job.id]);
        }
      } catch (error) {
        console.error("Error saving job:", error);
      }
    }
  };

  const handleApply = async (job: Job) => {
    if (!session) {
      alert("Veuillez vous connecter pour postuler");
      return;
    }

    // Pour les emplois locaux, rediriger vers la page de détails
    if (job.isLocal) {
      window.location.href = `/jobs/${job.id}`;
      return;
    }

    // Pour les emplois externes, enregistrer la candidature puis ouvrir le lien
    try {
      const response = await fetch("/api/applications/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          jobData: JSON.stringify(job),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAppliedJobIds([...appliedJobIds, job.id]);
        alert("Candidature enregistrée avec succès!");

        // Ouvrir le lien de candidature externe
        if (job.applyLink) {
          window.open(job.applyLink, "_blank");
        }
      } else {
        alert(data.error || "Erreur lors de l'enregistrement de la candidature");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Erreur lors de l'enregistrement de la candidature");
    }
  };

  // Initialize from URL params and auto-execute search
  useEffect(() => {
    const q = searchParams.get("q");
    const contractType = searchParams.get("contract_type");

    // Update form state from URL params
    if (q) {
      setSearchQuery(q);
    }
    if (contractType) {
      // Map contract type to filter format
      const typeMap: { [key: string]: string } = {
        "CDI": "cdi",
        "CDD": "cdd",
        "Stage": "stage",
        "Freelance": "freelance"
      };
      setSelectedType(typeMap[contractType] || "all");
    }

    // Auto-execute search if we have URL params
    if (q || contractType) {
      const executeSearch = async () => {
        setLoading(true);
        setError("");
        setHasSearched(true);

        try {
          const params = new URLSearchParams({
            query: q || "emploi",
            location: locationQuery || "Côte d'Ivoire",
            ...(contractType && contractType !== "all" && { type: contractType.toLowerCase() }),
            ...(selectedSource && selectedSource !== "all" && { source: selectedSource }),
          });

          const response = await fetch(`/api/jobs?${params}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch jobs");
          }

          setJobs(data.jobs || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Une erreur est survenue");
          setJobs([]);
        } finally {
          setLoading(false);
        }
      };

      executeSearch();
    }
  }, [searchParams]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setError("");
    setHasSearched(true);
    setCurrentPage(1); // Reset pagination

    try {
      const params = new URLSearchParams({
        query: searchQuery || "emploi",
        location: locationQuery || "Côte d'Ivoire",
        ...(selectedType && selectedType !== "all" && { type: selectedType }),
        ...(selectedSource && selectedSource !== "all" && { source: selectedSource }),
      });

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch jobs");
      }

      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const jobTypes = [
    { id: "all", label: "Tous" },
    { id: "cdi", label: "CDI" },
    { id: "cdd", label: "CDD" },
    { id: "stage", label: "Stage" },
    { id: "freelance", label: "Freelance" },
  ];

  const jobSources = [
    { id: "all", label: "Tous les emplois" },
    { id: "local", label: "Emplois locaux" },
    { id: "external", label: "Emplois externes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec logo et recherche - Style emploirapide.ci */}
      <div className="bg-white border-b border-grayLight py-3 md:py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            {/* Logo EmploiRapide */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/image.png"
                alt="EmploiRapide"
                className="h-7 md:h-8"
              />
            </Link>

            {/* Barre de recherche */}
            <div className="flex-1 flex items-center gap-2 md:gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-grayDark w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un emploi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-2.5 border border-grayLight rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>

              {/* Bouton de recherche */}
              <button
                onClick={(e: any) => handleSearch(e)}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 md:py-2.5 px-4 md:px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                ) : (
                  <span className="hidden sm:inline">Rechercher</span>
                )}
                {loading ? null : (
                  <Search className="w-4 h-4 sm:hidden" />
                )}
              </button>
            </div>

            {/* Lien Recherche par CV */}
            <Link
              href="/cv-analysis"
              className="hidden lg:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Recherche par CV
            </Link>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Barre d'informations et filtres */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <p className="text-sm text-grayDark">
                {!loading && jobs.length > 0 && (
                  <span className="font-semibold text-text">{jobs.length} résultats</span>
                )}
              </p>
              <div className="hidden sm:flex items-center gap-2 text-sm text-grayDark">
                <button className="text-primary hover:underline">Plus récent</button>
                {' | '}
                <button className="text-primary hover:underline">Moins récent</button>
              </div>
            </div>

            {/* Filtres source */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
              {jobSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedSource === source.id
                      ? 'bg-secondary text-white'
                      : 'bg-white border border-grayLight text-grayDark hover:border-secondary'
                  }`}
                >
                  {source.label}
                </button>
              ))}
            </div>

            {/* Filtres type de contrat */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {jobTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedType === type.id
                      ? 'bg-primary text-white'
                      : 'bg-white border border-grayLight text-grayDark hover:border-primary'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste des résultats */}
          <main>
            {error && (
              <div className="bg-error/10 border border-error text-error px-6 py-4 rounded-xl mb-6">
                <p className="font-semibold mb-1">Erreur</p>
                <p className="text-sm">{error}</p>
                {error.includes("API key") && (
                  <p className="text-sm mt-2">
                    Veuillez configurer votre clé API RapidAPI dans le fichier .env
                  </p>
                )}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-grayDark">Recherche d'offres d'emploi...</p>
                </div>
              </div>
            )}

            {!loading && hasSearched && jobs.length === 0 && !error && (
              <div className="text-center py-20">
                <p className="text-xl text-grayDark mb-2">Aucune offre trouvée</p>
                <p className="text-grayDark">Essayez avec d'autres mots-clés ou une autre localisation</p>
              </div>
            )}

            {!loading && jobs.length > 0 && (
              <>
                {/* Grille d'emplois en cartes - Style emploirapide.ci */}
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  {jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage).map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl shadow-sm border border-grayLight p-6 hover:shadow-lg hover:border-primary transition-all"
                    >
                      {/* En-tête avec badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {job.logo ? (
                            <div className="w-12 h-12 flex-shrink-0 bg-background rounded-lg p-2">
                              <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex-shrink-0 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-heading font-bold text-text hover:text-primary transition-colors line-clamp-2 mb-1">
                              {job.title}
                            </h3>
                            <p className="text-sm text-grayDark font-medium">{job.company}</p>
                          </div>
                        </div>
                        {job.isLocal ? (
                          <span className="flex-shrink-0 bg-success/10 text-success text-xs px-2.5 py-1 rounded-full font-semibold">
                            Local
                          </span>
                        ) : (
                          <span className="flex-shrink-0 bg-accent/10 text-accent text-xs px-2.5 py-1 rounded-full font-semibold">
                            Externe
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-grayDark line-clamp-3 mb-4">
                        {job.description}
                      </p>

                      {/* Informations */}
                      <div className="space-y-2 mb-4">
                        {job.location && (
                          <div className="flex items-center gap-2 text-sm text-grayDark">
                            <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        )}
                        {job.type && (
                          <div className="flex items-center gap-2 text-sm text-grayDark">
                            <Briefcase className="w-4 h-4 flex-shrink-0 text-primary" />
                            <span>{job.type}</span>
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center gap-2 text-sm text-grayDark">
                            <DollarSign className="w-4 h-4 flex-shrink-0 text-primary" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                        {job.postedAt && (
                          <div className="flex items-center gap-2 text-sm text-grayDark">
                            <Clock className="w-4 h-4 flex-shrink-0 text-primary" />
                            <span>{job.postedAt}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-4 border-t border-grayLight">
                        {/* Bouton cœur */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(job);
                          }}
                          className="flex-shrink-0 p-2 text-grayDark hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                          title={savedJobIds.includes(job.id) ? "Retirer des favoris" : "Sauvegarder"}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              savedJobIds.includes(job.id)
                                ? "fill-accent text-accent"
                                : ""
                            }`}
                          />
                        </button>

                        {/* Bouton Postuler */}
                        {appliedJobIds.includes(job.id) ? (
                          <span className="flex-1 px-4 py-2.5 bg-success/10 text-success rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Postulé
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(job);
                            }}
                            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
                          >
                            Postuler maintenant
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {jobs.length > jobsPerPage && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-grayLight rounded-lg text-sm font-medium text-grayDark hover:bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(jobs.length / jobsPerPage) }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'text-grayDark hover:bg-background'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(jobs.length / jobsPerPage), currentPage + 1))}
                      disabled={currentPage === Math.ceil(jobs.length / jobsPerPage)}
                      className="px-4 py-2 border border-grayLight rounded-lg text-sm font-medium text-grayDark hover:bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage(Data:data) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <SearchPageContent {...Data} />
    </Suspense>
  );
}

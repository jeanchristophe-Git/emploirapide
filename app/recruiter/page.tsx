"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Navbar from "@/components/Navbar";
import RecruiterProfileTab from "@/components/RecruiterProfileTab";
import { Plus, Briefcase, Users, Eye, Edit, Trash2, TrendingUp, FileText, Search, MapPin, Clock, DollarSign, LogOut, Settings, Building2, Camera } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  contract_type: string;
  category: string;
  keywords: string;
  status: string;
  createdAt: string;
  _count?: {
    applications: number;
  };
}

interface Application {
  id: string;
  userId: string;
  jobId: string;
  coverLetter: string | null;
  status: string;
  createdAt: string;
  job: Job;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function RecruiterPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [jobPostings, setJobPostings] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profileData, setProfileData] = useState<any>(null);

  // Form state for new job
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    salary_min: "",
    salary_max: "",
    contract_type: "CDI",
    category: "informatique",
  });

  // Edit mode
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  // Profile states
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch recruiter's profile, job postings, and applications
      const [profileRes, jobsRes, appsRes] = await Promise.all([
        fetch("/api/recruiter/profile"),
        fetch("/api/recruiter/jobs"),
        fetch("/api/applications"),
      ]);

      if (profileRes.ok) {
        const profileDataRes = await profileRes.json();
        setProfileData(profileDataRes.user || null);
        if (profileDataRes.user?.profilePhoto) {
          setLogoPreview(profileDataRes.user.profilePhoto);
        }
      }

      if (!jobsRes.ok) {
        const errorData = await jobsRes.json();
        throw new Error(errorData.error || "Erreur lors du chargement des offres");
      }
      const jobsData = await jobsRes.json();
      setJobPostings(jobsData.jobs || []);

      if (!appsRes.ok) {
        const errorData = await appsRes.json();
        throw new Error(errorData.error || "Erreur lors du chargement des candidatures");
      }
      const appsData = await appsRes.json();
      setApplications(appsData.applications || []);
    } catch (err: any) {
      console.error("Erreur de chargement:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

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

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Salaire non spécifié";
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} FCFA`;
    if (min) return `À partir de ${min.toLocaleString()} FCFA`;
    if (max) return `Jusqu'à ${max.toLocaleString()} FCFA`;
    return "Salaire non spécifié";
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newJob.title || !newJob.location || !newJob.description) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/recruiter/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newJob,
          company: profileData?.companyName || newJob.company,
          salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : null,
          salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      // Reset form and close modal
      setNewJob({
        title: "",
        company: "",
        location: "",
        description: "",
        requirements: "",
        salary_min: "",
        salary_max: "",
        contract_type: "CDI",
        category: "informatique",
      });
      setShowNewJobModal(false);

      // Reload data
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la création de l'offre");
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requirements: job.requirements || "",
      salary_min: job.salary_min?.toString() || "",
      salary_max: job.salary_max?.toString() || "",
      contract_type: job.contract_type,
      category: job.category,
    });
    setShowNewJobModal(true);
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      setLoading(true);
      const res = await fetch("/api/recruiter/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingJob.id,
          ...newJob,
          salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : null,
          salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      setNewJob({
        title: "",
        company: "",
        location: "",
        description: "",
        requirements: "",
        salary_min: "",
        salary_max: "",
        contract_type: "CDI",
        category: "informatique",
      });
      setEditingJob(null);
      setShowNewJobModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/recruiter/jobs?id=${jobId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la suppression");
      }

      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la mise à jour du statut");
    }
  };

  const stats = [
    {
      label: "Offres actives",
      value: jobPostings.filter(j => j.status === "active").length.toString(),
      icon: Briefcase,
      color: "text-primary"
    },
    {
      label: "Candidatures reçues",
      value: applications.length.toString(),
      icon: FileText,
      color: "text-secondary"
    },
    {
      label: "Total offres",
      value: jobPostings.length.toString(),
      icon: Eye,
      color: "text-success"
    },
    {
      label: "Candidats présélectionnés",
      value: applications.filter(a => a.status === "shortlisted").length.toString(),
      icon: Users,
      color: "text-accent"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-3 py-1 bg-success/10 text-success rounded-lg text-sm font-semibold">Active</span>;
      case "paused":
        return <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-sm font-semibold">En pause</span>;
      default:
        return <span className="px-3 py-1 bg-grayLight text-grayDark rounded-lg text-sm font-semibold">Fermée</span>;
    }
  };

  const getCandidateStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "new":
        return <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold">Nouveau</span>;
      case "reviewed":
        return <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-sm font-semibold">Examiné</span>;
      case "shortlisted":
        return <span className="px-3 py-1 bg-success/10 text-success rounded-lg text-sm font-semibold">Présélectionné</span>;
      case "rejected":
        return <span className="px-3 py-1 bg-error/10 text-error rounded-lg text-sm font-semibold">Rejeté</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Navigation mobile en bas */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-grayLight z-50 safe-area-bottom">
        <nav className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === "dashboard" ? "text-primary" : "text-grayDark"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-medium">Accueil</span>
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === "jobs" ? "text-primary" : "text-grayDark"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-xs font-medium">Offres</span>
          </button>
          <button
            onClick={() => setShowNewJobModal(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 bg-primary text-white rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Publier</span>
          </button>
          <button
            onClick={() => setActiveTab("candidates")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === "candidates" ? "text-primary" : "text-grayDark"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-medium">Candidats</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === "settings" ? "text-primary" : "text-grayDark"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Paramètres</span>
          </button>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 pb-20 lg:pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop only */}
          <aside className="lg:w-80 shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6 sticky top-4">
              <div className="text-center mb-6 pb-6 border-b border-grayLight">
                <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo entreprise"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-primary" />
                  )}
                </div>
                <h2 className="font-heading font-bold text-xl text-text mb-1">
                  {profileData?.companyName || "Entreprise"}
                </h2>
                <p className="text-grayDark text-sm">{profileData?.name || session?.user?.name || "Recruteur"}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "dashboard"
                      ? "bg-primary text-white"
                      : "text-grayDark hover:bg-background"
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Tableau de bord</span>
                </button>
                <button
                  onClick={() => setActiveTab("jobs")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "jobs"
                      ? "bg-primary text-white"
                      : "text-grayDark hover:bg-background"
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="font-semibold">Mes offres</span>
                </button>
                <button
                  onClick={() => setActiveTab("candidates")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "candidates"
                      ? "bg-primary text-white"
                      : "text-grayDark hover:bg-background"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">Candidats</span>
                </button>
                <button
                  onClick={() => setActiveTab("search")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "search"
                      ? "bg-primary text-white"
                      : "text-grayDark hover:bg-background"
                  }`}
                >
                  <Search className="w-5 h-5" />
                  <span className="font-semibold">Rechercher candidats</span>
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "settings"
                      ? "bg-primary text-white"
                      : "text-grayDark hover:bg-background"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-semibold">Paramètres</span>
                </button>
              </nav>

              <button
                onClick={() => setShowNewJobModal(true)}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                Publier une offre
              </button>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full mt-3 bg-error/10 hover:bg-error/20 text-error font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {status === "loading" && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {loading && status === "authenticated" && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {error && status === "authenticated" && !loading && (
              <div className="bg-error/10 border border-error text-error rounded-xl p-4 mb-6">
                <p className="font-semibold mb-2">Erreur de chargement</p>
                <p>{error}</p>
              </div>
            )}

            {!loading && status === "authenticated" && (
              <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-text mb-4 md:mb-6">
                  Tableau de bord recruteur
                </h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-grayLight p-4 md:p-6"
                    >
                      <div className="flex flex-col gap-3">
                        <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-background ${stat.color} w-fit`}>
                          <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <span className="text-2xl md:text-3xl font-heading font-bold text-text block mb-1">
                            {stat.value}
                          </span>
                          <p className="text-grayDark text-xs md:text-sm">{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Jobs & Candidates */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6">
                    <h2 className="text-xl font-heading font-bold text-text mb-4">
                      Offres récentes
                    </h2>
                    {jobPostings.length === 0 ? (
                      <p className="text-grayDark text-center py-4">
                        Aucune offre publiée pour le moment
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {jobPostings.slice(0, 3).map((job) => (
                          <div
                            key={job.id}
                            className="pb-4 border-b border-grayLight last:border-0"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-text">{job.title}</h3>
                              {getStatusBadge(job.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-grayDark">
                              <span>{job._count?.applications || 0} candidatures</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6">
                    <h2 className="text-xl font-heading font-bold text-text mb-4">
                      Nouveaux candidats
                    </h2>
                    {applications.length === 0 ? (
                      <p className="text-grayDark text-center py-4">
                        Aucune candidature reçue pour le moment
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {applications.slice(0, 3).map((application) => (
                          <div
                            key={application.id}
                            className="pb-4 border-b border-grayLight last:border-0"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-text">
                                  {application.user.name || "Candidat"}
                                </h3>
                                <p className="text-sm text-grayDark">{application.job.title}</p>
                              </div>
                              {getCandidateStatusBadge(application.status)}
                            </div>
                            <p className="text-xs text-grayDark">{formatDate(application.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === "jobs" && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-text">Mes offres d&apos;emploi</h1>
                  <button
                    onClick={() => setShowNewJobModal(true)}
                    className="hidden sm:flex bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 md:px-6 rounded-xl items-center gap-2 transition-all text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    Nouvelle offre
                  </button>
                </div>

                {jobPostings.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-12 text-center">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-grayDark opacity-30" />
                    <h3 className="text-xl font-heading font-bold text-text mb-2">
                      Aucune offre publiée
                    </h3>
                    <p className="text-grayDark mb-6">
                      Commencez à publier des offres pour attirer les meilleurs talents
                    </p>
                    <button
                      onClick={() => setShowNewJobModal(true)}
                      className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl inline-flex items-center gap-2 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Publier une offre
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {jobPostings.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-grayLight p-4 md:p-6"
                      >
                        <div className="flex flex-col gap-3 mb-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="text-lg md:text-xl font-heading font-bold text-text flex-1">
                                {job.title}
                              </h3>
                              {getStatusBadge(job.status)}
                            </div>
                            <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-grayDark">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{job.contract_type}</span>
                              </div>
                              <div className="hidden sm:flex items-center gap-1">
                                <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                              </div>
                              <div className="hidden sm:flex items-center gap-1">
                                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{formatDate(job.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 md:pt-4 border-t border-grayLight">
                          <div className="flex items-center gap-2 text-xs md:text-sm text-grayDark">
                            <Users className="w-4 h-4" />
                            <span><strong>{job._count?.applications || 0}</strong> candidatures</span>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => setViewingJob(job)}
                              className="p-2 border border-grayLight rounded-xl hover:bg-background transition-all"
                              title="Voir les détails"
                            >
                              <Eye className="w-5 h-5 text-grayDark" />
                            </button>
                            <button
                              onClick={() => handleEditJob(job)}
                              className="p-2 border border-grayLight rounded-xl hover:bg-background transition-all"
                              title="Modifier"
                            >
                              <Edit className="w-5 h-5 text-grayDark" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-2 border border-grayLight rounded-xl hover:bg-error/10 hover:border-error transition-all"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5 text-error" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Candidates Tab */}
            {activeTab === "candidates" && (
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-text mb-4 md:mb-6">
                  Candidatures reçues
                </h1>

                {/* Filters */}
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-grayLight p-3 md:p-4 mb-4 md:mb-6">
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <select className="px-4 py-2 border border-grayLight rounded-xl focus:border-primary outline-none">
                      <option>Toutes les offres</option>
                      {jobPostings.map((job) => (
                        <option key={job.id}>{job.title}</option>
                      ))}
                    </select>
                    <select className="px-4 py-2 border border-grayLight rounded-xl focus:border-primary outline-none">
                      <option>Tous les statuts</option>
                      <option>Nouveau</option>
                      <option>Examiné</option>
                      <option>Présélectionné</option>
                      <option>Rejeté</option>
                    </select>
                  </div>
                </div>

                {applications.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-grayDark opacity-30" />
                    <h3 className="text-xl font-heading font-bold text-text mb-2">
                      Aucune candidature reçue
                    </h3>
                    <p className="text-grayDark">
                      Les candidatures apparaîtront ici lorsque des candidats postuleront à vos offres
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="bg-white rounded-2xl shadow-sm border border-grayLight p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                              <Users className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-xl font-heading font-bold text-text mb-1">
                                {application.user.name || "Candidat"}
                              </h3>
                              <p className="text-grayDark mb-2">{application.user.email}</p>
                              {application.coverLetter && (
                                <p className="text-sm text-grayDark mt-2 line-clamp-2">
                                  {application.coverLetter}
                                </p>
                              )}
                            </div>
                          </div>
                          {getCandidateStatusBadge(application.status)}
                        </div>

                        <div className="pt-4 border-t border-grayLight">
                          <p className="text-sm text-grayDark mb-3">
                            A postulé pour : <strong>{application.job.title}</strong> • {formatDate(application.createdAt)}
                          </p>
                          <div className="flex gap-2">
                            {application.status !== "shortlisted" && (
                              <button
                                onClick={() => handleUpdateApplicationStatus(application.id, "shortlisted")}
                                className="px-4 py-2 bg-success/10 text-success rounded-xl font-semibold hover:bg-success hover:text-white transition-all"
                              >
                                Présélectionner
                              </button>
                            )}
                            {application.status !== "reviewed" && (
                              <button
                                onClick={() => handleUpdateApplicationStatus(application.id, "reviewed")}
                                className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
                              >
                                Marquer comme examiné
                              </button>
                            )}
                            {application.status !== "rejected" && (
                              <button
                                onClick={() => handleUpdateApplicationStatus(application.id, "rejected")}
                                className="px-4 py-2 border border-error text-error rounded-xl font-semibold hover:bg-error/10 transition-all"
                              >
                                Rejeter
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Candidates Tab */}
            {activeTab === "search" && (
              <div>
                <h1 className="text-3xl font-heading font-bold text-text mb-6">
                  Rechercher des candidats
                </h1>

                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6 mb-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Compétences, poste..."
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Localisation..."
                      className="input-field"
                    />
                    <button className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all">
                      <Search className="w-5 h-5 inline mr-2" />
                      Rechercher
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-8 text-center text-grayDark">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Utilisez les filtres ci-dessus pour rechercher des candidats</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <RecruiterProfileTab
                profileData={profileData}
                logoPreview={logoPreview}
                setLogoPreview={setLogoPreview}
                onProfileUpdate={loadData}
              />
            )}
            </>
            )}
          </main>
        </div>
      </div>

      {/* New Job Modal (simplified) */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-heading font-bold text-text mb-6">
              {editingJob ? "Modifier l'offre" : "Publier une nouvelle offre"}
            </h2>
            <form onSubmit={editingJob ? handleUpdateJob : handleSubmitJob} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Titre du poste *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Développeur Full Stack"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Localisation *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ex: Abidjan, Plateau"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Type de contrat *
                  </label>
                  <select
                    className="input-field"
                    value={newJob.contract_type}
                    onChange={(e) => setNewJob({ ...newJob, contract_type: e.target.value })}
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Salaire minimum (FCFA)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Ex: 800000"
                    value={newJob.salary_min}
                    onChange={(e) => setNewJob({ ...newJob, salary_min: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Salaire maximum (FCFA)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Ex: 1200000"
                    value={newJob.salary_max}
                    onChange={(e) => setNewJob({ ...newJob, salary_max: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Catégorie *
                </label>
                <select
                  className="input-field"
                  value={newJob.category}
                  onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                >
                  <option value="informatique">Informatique</option>
                  <option value="finance">Finance</option>
                  <option value="marketing">Marketing</option>
                  <option value="vente">Vente</option>
                  <option value="rh">Ressources Humaines</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Description *
                </label>
                <textarea
                  rows={6}
                  className="input-field resize-none"
                  placeholder="Décrivez le poste..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Exigences / Qualifications
                </label>
                <textarea
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Listez les exigences et qualifications requises..."
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={loading}
                >
                  {loading ? (editingJob ? "Mise à jour..." : "Publication...") : (editingJob ? "Mettre à jour" : "Publier l'offre")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewJobModal(false);
                    setEditingJob(null);
                    setNewJob({
                      title: "",
                      company: "",
                      location: "",
                      description: "",
                      requirements: "",
                      salary_min: "",
                      salary_max: "",
                      contract_type: "CDI",
                      category: "informatique",
                    });
                  }}
                  className="flex-1 btn-outline"
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Job Details Modal */}
      {viewingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-heading font-bold text-text mb-2">
                  {viewingJob.title}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-grayDark">{viewingJob.company}</span>
                  <span className="text-grayDark">•</span>
                  <span className="text-grayDark">{viewingJob.location}</span>
                </div>
              </div>
              {getStatusBadge(viewingJob.status)}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-text mb-2 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Type de contrat
                </h3>
                <p className="text-grayDark">{viewingJob.contract_type}</p>
              </div>

              <div>
                <h3 className="font-semibold text-text mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Salaire
                </h3>
                <p className="text-grayDark">{formatSalary(viewingJob.salary_min, viewingJob.salary_max)}</p>
              </div>

              <div>
                <h3 className="font-semibold text-text mb-2">Description</h3>
                <p className="text-grayDark whitespace-pre-line">{viewingJob.description}</p>
              </div>

              {viewingJob.requirements && (
                <div>
                  <h3 className="font-semibold text-text mb-2">Exigences</h3>
                  <p className="text-grayDark whitespace-pre-line">{viewingJob.requirements}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-text mb-2">Informations</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-grayDark">Catégorie:</span>
                    <p className="font-semibold text-text capitalize">{viewingJob.category}</p>
                  </div>
                  <div>
                    <span className="text-grayDark">Candidatures:</span>
                    <p className="font-semibold text-text">{viewingJob._count?.applications || 0}</p>
                  </div>
                  <div>
                    <span className="text-grayDark">Publié le:</span>
                    <p className="font-semibold text-text">{formatDate(viewingJob.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-grayDark">Statut:</span>
                    <p className="font-semibold text-text capitalize">{viewingJob.status}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setViewingJob(null);
                  handleEditJob(viewingJob);
                }}
                className="flex-1 bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-all"
              >
                Modifier
              </button>
              <button
                onClick={() => setViewingJob(null)}
                className="flex-1 btn-outline"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

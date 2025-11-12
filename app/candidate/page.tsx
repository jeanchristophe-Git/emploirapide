"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CandidateEnrichedProfile from "@/components/CandidateEnrichedProfile";
import { compressImage } from "@/lib/imageCompression";
import { User, Briefcase, FileText, Heart, Settings, Bell, TrendingUp, Clock, MapPin, Building2, Loader2, Trash2, LogOut, Upload, File, Camera, Award } from "lucide-react";

interface Application {
  id: string;
  status: string;
  createdAt: string;
  jobTitle: string;
  company: string;
  location: string;
  appliedAt: string;
  job: {
    title: string;
    company: string;
    location: string;
  };
}

interface ExternalApplication {
  id: string;
  jobId: string;
  status: string;
  appliedAt: string;
  title: string;
  company: string;
  location: string;
  type: string;
  applyLink: string;
}

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  postedAt: string;
  savedAt: string;
  savedJobId: string;
  jobId: string;
}

export default function CandidatePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [applications, setApplications] = useState<Application[]>([]);
  const [externalApplications, setExternalApplications] = useState<ExternalApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [profileData, setProfileData] = useState<any>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsRes, externalAppsRes, savedRes, profileRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/applications/external"),
        fetch("/api/saved-jobs"),
        fetch("/api/candidate/profile"),
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications || []);
      }

      if (externalAppsRes.ok) {
        const externalAppsData = await externalAppsRes.json();
        setExternalApplications(externalAppsData.applications || []);
      }

      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedJobs(savedData.jobs || []);
      }

      if (profileRes.ok) {
        const profileDataRes = await profileRes.json();
        setProfileData(profileDataRes.user || null);
        if (profileDataRes.user?.profilePhoto) {
          setProfilePhotoPreview(profileDataRes.user.profilePhoto);
        }
      }
    } catch (err) {
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/saved-jobs?jobId=${jobId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSavedJobs(savedJobs.filter((job) => job.jobId !== jobId));
      }
    } catch (err) {
      console.error("Error removing saved job:", err);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const profileUpdate: any = {
        name: `${formData.get("firstName")} ${formData.get("lastName")}`,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        about: formData.get("about") as string,
      };

      // Add profile photo if changed
      if (profilePhotoPreview && profilePhotoPreview.startsWith("data:")) {
        profileUpdate.profilePhoto = profilePhotoPreview;
      }

      const res = await fetch("/api/candidate/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileUpdate),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      // Rafraîchir la session pour mettre à jour la photo de profil partout
      if (update) {
        await update();
      }

      // Upload CV if selected
      if (cvFile) {
        setCvUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const cvRes = await fetch("/api/candidate/cv", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cvFile: reader.result,
                filename: cvFile.name,
              }),
            });

            if (!cvRes.ok) {
              const errorData = await cvRes.json();
              throw new Error(errorData.error || "Erreur lors de l'upload du CV");
            }

            setCvFile(null);
            alert("Profil et CV mis à jour avec succès!");
          } catch (cvError: any) {
            alert(cvError.message || "Erreur lors de l'upload du CV");
          } finally {
            setCvUploading(false);
          }
        };
        reader.readAsDataURL(cvFile);
      } else {
        alert("Profil mis à jour avec succès!");
      }

      await loadData();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setProfileSaving(false);
    }
  };

  const stats = [
    { label: "Candidatures envoyées", value: (applications.length + externalApplications.length).toString(), icon: FileText, color: "text-primary" },
    { label: "Emplois sauvegardés", value: savedJobs.length.toString(), icon: Heart, color: "text-accent" },
    { label: "Vues de profil", value: "0", icon: TrendingUp, color: "text-success" },
    { label: "Réponses reçues", value: applications.filter((a) => a.status !== "pending").length.toString(), icon: Bell, color: "text-secondary" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-secondary/10 text-secondary";
      case "accepted":
        return "bg-success/10 text-success";
      case "rejected":
        return "bg-error/10 text-error";
      default:
        return "bg-grayLight text-grayDark";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En cours";
      case "accepted":
        return "Acceptée";
      case "rejected":
        return "Refusée";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Navigation mobile en bas */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-grayLight z-50 safe-area-bottom">
        <nav className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === "dashboard"
                ? "text-primary"
                : "text-grayDark"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-medium">Accueil</span>
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === "applications"
                ? "text-primary"
                : "text-grayDark"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs font-medium">Candidatures</span>
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === "saved"
                ? "text-primary"
                : "text-grayDark"
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs font-medium">Favoris</span>
          </button>
          <button
            onClick={() => setActiveTab("cv")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === "cv"
                ? "text-primary"
                : "text-grayDark"
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-xs font-medium">Mon CV</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === "profile"
                ? "text-primary"
                : "text-grayDark"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Profil</span>
          </button>
        </nav>
      </div>

      <div className="flex">
        {/* Sidebar fixe à gauche - Desktop only */}
        <aside className="w-72 bg-white border-r border-grayLight min-h-screen sticky top-0 hidden lg:block">
          <div className="p-6">
            {/* Profile Summary */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-grayLight">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                {profileData?.profilePhoto || session?.user?.profilePhoto ? (
                  <img
                    src={profileData?.profilePhoto || session?.user?.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading font-bold text-base text-text truncate mb-1">
                  {session?.user?.name || "Utilisateur"}
                </h2>
                <p className="text-grayDark text-xs truncate">
                  {session?.user?.email || ""}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                  activeTab === "dashboard"
                    ? "bg-primary text-white shadow-sm"
                    : "text-grayDark hover:bg-background"
                }`}
              >
                <TrendingUp className="w-5 h-5 shrink-0" />
                <span className="font-medium">Tableau de bord</span>
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                  activeTab === "applications"
                    ? "bg-primary text-white shadow-sm"
                    : "text-grayDark hover:bg-background"
                }`}
              >
                <FileText className="w-5 h-5 shrink-0" />
                <span className="font-medium">Mes candidatures</span>
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                  activeTab === "saved"
                    ? "bg-primary text-white shadow-sm"
                    : "text-grayDark hover:bg-background"
                }`}
              >
                <Heart className="w-5 h-5 shrink-0" />
                <span className="font-medium">Emplois sauvegardés</span>
              </button>
              <button
                onClick={() => setActiveTab("cv")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                  activeTab === "cv"
                    ? "bg-primary text-white shadow-sm"
                    : "text-grayDark hover:bg-background"
                }`}
              >
                <Award className="w-5 h-5 shrink-0" />
                <span className="font-medium">Mon CV</span>
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                  activeTab === "profile"
                    ? "bg-primary text-white shadow-sm"
                    : "text-grayDark hover:bg-background"
                }`}
              >
                <User className="w-5 h-5 shrink-0" />
                <span className="font-medium">Mon profil</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                  activeTab === "settings"
                    ? "bg-primary text-white shadow-sm"
                    : "text-grayDark hover:bg-background"
                }`}
              >
                <Settings className="w-5 h-5 shrink-0" />
                <span className="font-medium">Paramètres</span>
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-grayLight">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-error/10 hover:bg-error/20 text-error font-medium rounded-lg transition-all text-sm"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl pb-20 lg:pb-8 overflow-x-hidden">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-text mb-4 md:mb-6">
                  Tableau de bord
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

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6 mb-8">
                  <h2 className="text-xl font-heading font-bold text-text mb-4">
                    Activité récente
                  </h2>
                  <div className="space-y-4">
                    {applications.length === 0 && externalApplications.length === 0 ? (
                      <p className="text-center text-grayDark py-8">
                        Aucune candidature pour le moment. Commencez votre recherche!
                      </p>
                    ) : (
                      <>
                        {/* Local Applications */}
                        {applications.slice(0, 2).map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between pb-4 border-b border-grayLight last:border-0"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-text">{app.job.title}</h3>
                                <span className="bg-success/10 text-success text-xs px-2 py-0.5 rounded font-semibold">
                                  Local
                                </span>
                              </div>
                              <p className="text-sm text-grayDark">{app.job.company}</p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(
                                  app.status
                                )}`}
                              >
                                {getStatusLabel(app.status)}
                              </span>
                              <p className="text-xs text-grayDark mt-1">
                                {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        ))}
                        {/* External Applications */}
                        {externalApplications.slice(0, Math.max(0, 3 - applications.length)).map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between pb-4 border-b border-grayLight last:border-0"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-text">{app.title}</h3>
                                <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded font-semibold">
                                  Externe
                                </span>
                              </div>
                              <p className="text-sm text-grayDark">{app.company}</p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(
                                  app.status
                                )}`}
                              >
                                {getStatusLabel(app.status)}
                              </span>
                              <p className="text-xs text-grayDark mt-1">
                                {new Date(app.appliedAt).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6">
                  <h2 className="text-xl font-heading font-bold text-text mb-4">
                    Emplois recommandés
                  </h2>
                  <div className="space-y-4">
                    {savedJobs.length === 0 ? (
                      <p className="text-center text-grayDark py-8">
                        Aucun emploi sauvegardé. Parcourez les offres et sauvegardez celles qui vous intéressent!
                      </p>
                    ) : (
                      savedJobs.slice(0, 3).map((job) => (
                        <div
                          key={job.id}
                          className="p-4 border border-grayLight rounded-xl hover:border-primary transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-heading font-bold text-text">{job.title}</h3>
                            <button
                              onClick={() => handleRemoveSavedJob(job.jobId)}
                              className="text-grayDark hover:text-error transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-grayDark mb-2">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-grayDark">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{job.postedAt}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === "applications" && (
              <div>
                <h1 className="text-3xl font-heading font-bold text-text mb-6">
                  Mes candidatures
                </h1>

                {/* Local Applications */}
                {applications.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-heading font-semibold text-text mb-4 flex items-center gap-2">
                      Candidatures locales
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {applications.length}
                      </span>
                    </h2>
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div
                          key={app.id}
                          className="bg-white rounded-2xl shadow-sm border border-grayLight p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-heading font-bold text-text">
                                  {app.job.title}
                                </h3>
                                <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-lg font-semibold">
                                  Local
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-grayDark mb-2">
                                <Building2 className="w-4 h-4" />
                                <span className="font-semibold">{app.job.company}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-grayDark">
                                <MapPin className="w-4 h-4" />
                                <span>{app.job.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(
                                  app.status
                                )}`}
                              >
                                {getStatusLabel(app.status)}
                              </span>
                              <p className="text-sm text-grayDark mt-2">
                                {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all">
                              Voir les détails
                            </button>
                            <button className="px-4 py-2 border border-grayLight text-grayDark rounded-xl font-semibold hover:bg-background transition-all">
                              Retirer candidature
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Applications */}
                {externalApplications.length > 0 && (
                  <div>
                    <h2 className="text-xl font-heading font-semibold text-text mb-4 flex items-center gap-2">
                      Candidatures externes
                      <span className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full">
                        {externalApplications.length}
                      </span>
                    </h2>
                    <div className="space-y-4">
                      {externalApplications.map((app) => (
                        <div
                          key={app.id}
                          className="bg-white rounded-2xl shadow-sm border border-grayLight p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-heading font-bold text-text">
                                  {app.title}
                                </h3>
                                <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-lg font-semibold">
                                  Externe
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-grayDark mb-2">
                                <Building2 className="w-4 h-4" />
                                <span className="font-semibold">{app.company}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-grayDark">
                                <MapPin className="w-4 h-4" />
                                <span>{app.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(
                                  app.status
                                )}`}
                              >
                                {getStatusLabel(app.status)}
                              </span>
                              <p className="text-sm text-grayDark mt-2">
                                {new Date(app.appliedAt).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {app.applyLink && (
                              <a
                                href={app.applyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
                              >
                                Voir l'offre
                              </a>
                            )}
                            <button className="px-4 py-2 border border-grayLight text-grayDark rounded-xl font-semibold hover:bg-background transition-all">
                              Archiver
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {applications.length === 0 && externalApplications.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-12 text-center">
                    <FileText className="w-16 h-16 text-grayLight mx-auto mb-4" />
                    <h3 className="text-xl font-heading font-bold text-text mb-2">
                      Aucune candidature pour le moment
                    </h3>
                    <p className="text-grayDark mb-6">
                      Commencez votre recherche et postulez aux offres qui vous intéressent!
                    </p>
                    <button
                      onClick={() => router.push("/search")}
                      className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
                    >
                      Rechercher des emplois
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Saved Jobs Tab */}
            {activeTab === "saved" && (
              <div>
                <h1 className="text-3xl font-heading font-bold text-text mb-6">
                  Emplois sauvegardés
                </h1>
                <div className="grid md:grid-cols-2 gap-6">
                  {savedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl shadow-sm border border-grayLight p-6 hover:shadow-lg transition-all"
                    >
                      <h3 className="text-xl font-heading font-bold text-text mb-2">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-grayDark mb-3">
                        <Building2 className="w-4 h-4" />
                        <span className="font-semibold">{job.company}</span>
                      </div>
                      <div className="space-y-2 mb-4 text-sm text-grayDark">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{job.postedAt}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-primary text-white py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all">
                          Postuler
                        </button>
                        <button
                          onClick={() => handleRemoveSavedJob(job.jobId)}
                          className="p-2 border border-grayLight rounded-xl hover:bg-error/10 hover:border-error transition-all"
                          title="Retirer des favoris"
                        >
                          <Heart className="w-5 h-5 text-accent fill-accent" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CV Tab */}
            {activeTab === "cv" && (
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-text mb-4 md:mb-6">
                  Mon CV Professionnel
                </h1>
                <p className="text-grayDark mb-6">
                  Construisez votre CV détaillé pour que les recruteurs puissent mieux évaluer votre profil.
                </p>
                <CandidateEnrichedProfile
                  profileData={profileData}
                  onSave={async (data) => {
                    const res = await fetch("/api/candidate/profile", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });

                    if (!res.ok) {
                      const errorData = await res.json();
                      throw new Error(errorData.error || "Erreur lors de la mise à jour");
                    }

                    await loadData();
                  }}
                />
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h1 className="text-3xl font-heading font-bold text-text mb-6">Mon profil</h1>
                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-8">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Profile Photo Upload */}
                    <div className="flex flex-col items-center pb-6 border-b border-grayLight max-w-full">
                      <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-primary/10 border-4 border-primary/20">
                          {profilePhotoPreview ? (
                            <img
                              src={profilePhotoPreview}
                              alt="Photo de profil"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <User className="w-16 h-16 text-primary" />
                            </div>
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-2 cursor-pointer shadow-lg transition-all">
                          <Camera className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  alert("L'image est trop volumineuse. Maximum 2MB.");
                                  return;
                                }
                                if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                                  alert("Veuillez sélectionner une image JPG ou PNG.");
                                  return;
                                }
                                setProfilePhoto(file);
                                const compressed = await compressImage(file);
                                setProfilePhotoPreview(compressed);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-grayDark mt-3">
                        JPG ou PNG, maximum 2MB
                      </p>
                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePhoto(null);
                            setProfilePhotoPreview(profileData?.profilePhoto || "");
                          }}
                          className="mt-2 text-sm text-error hover:underline"
                        >
                          Supprimer la photo
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-text mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          defaultValue={profileData?.name?.split(' ')[0] || session?.user?.name?.split(' ')[0] || ""}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          defaultValue={profileData?.name?.split(' ').slice(1).join(' ') || session?.user?.name?.split(' ').slice(1).join(' ') || ""}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Email
                        </label>
                      <input
                        type="email"
                        defaultValue={session?.user?.email || ""}
                        className="input-field"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={profileData?.phone || ""}
                        placeholder="+225 XX XX XX XX XX"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        name="address"
                        defaultValue={profileData?.address || ""}
                        placeholder="Ex: Cocody, Abidjan"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        name="city"
                        defaultValue={profileData?.city || ""}
                        placeholder="Ex: Abidjan"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        À propos de moi
                      </label>
                      <textarea
                        name="about"
                        rows={4}
                        defaultValue={profileData?.about || ""}
                        placeholder="Parlez un peu de vous, de votre expérience..."
                        className="input-field resize-none"
                      />
                    </div>

                    {/* CV Upload Section */}
                    <div className="border-t border-grayLight pt-6 max-w-full">
                      <label className="block text-sm font-semibold text-text mb-2">
                        CV / Curriculum Vitae
                      </label>
                      <p className="text-sm text-grayDark mb-4">
                        Téléchargez votre CV au format PDF (max 5MB)
                      </p>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <label className="flex-1 cursor-pointer min-w-0">
                          <div className="border-2 border-dashed border-grayLight rounded-xl p-4 md:p-6 hover:border-primary hover:bg-primary/5 transition-all text-center">
                            {cvFile ? (
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <File className="w-8 h-8 text-primary flex-shrink-0" />
                                <div className="text-center sm:text-left min-w-0">
                                  <p className="font-semibold text-text truncate">{cvFile.name}</p>
                                  <p className="text-sm text-grayDark">
                                    {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <Upload className="w-8 h-8 text-grayDark mx-auto mb-2" />
                                <p className="text-xs md:text-sm text-grayDark">
                                  Cliquez pour sélectionner votre CV
                                </p>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  alert("Le fichier est trop volumineux. Maximum 5MB.");
                                  return;
                                }
                                if (file.type !== "application/pdf") {
                                  alert("Veuillez sélectionner un fichier PDF.");
                                  return;
                                }
                                setCvFile(file);
                              }
                            }}
                          />
                        </label>

                        {cvFile && (
                          <button
                            type="button"
                            onClick={() => setCvFile(null)}
                            className="px-4 py-2 border border-error text-error rounded-xl hover:bg-error/10 transition-all"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={profileSaving || cvUploading}
                    >
                      {profileSaving || cvUploading ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div>
                <h1 className="text-3xl font-heading font-bold text-text mb-6">Paramètres</h1>
                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-text mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-background transition-colors">
                          <span className="text-grayDark">Nouvelles opportunités d&apos;emploi</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-background transition-colors">
                          <span className="text-grayDark">Mises à jour de candidatures</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-background transition-colors">
                          <span className="text-grayDark">Messages des recruteurs</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                        </label>
                      </div>
                    </div>
                    <div className="border-t border-grayLight pt-6">
                      <h3 className="font-semibold text-text mb-4">Confidentialité</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-background transition-colors">
                          <span className="text-grayDark">Profil visible par les recruteurs</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-background transition-colors">
                          <span className="text-grayDark">Afficher mon CV aux entreprises</span>
                          <input type="checkbox" className="w-5 h-5 accent-primary" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
  );
}

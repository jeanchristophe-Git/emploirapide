"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Upload, FileText, CheckCircle, TrendingUp, Briefcase, MapPin, DollarSign, Star, AlertCircle } from "lucide-react";

export default function CVAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  // Données factices d'analyse
  const cvAnalysis = {
    profile: {
      name: "Jean Kouadio",
      title: "Développeur Full Stack",
      experience: "5 ans",
      location: "Abidjan, Côte d'Ivoire",
      email: "jean.kouadio@email.com",
      phone: "+225 07 00 00 00 00",
    },
    skills: [
      { name: "React", level: 90 },
      { name: "Node.js", level: 85 },
      { name: "TypeScript", level: 80 },
      { name: "Next.js", level: 75 },
      { name: "PostgreSQL", level: 70 },
      { name: "Docker", level: 65 },
    ],
    strengths: [
      "Solide expérience en développement full stack",
      "Maîtrise des technologies modernes (React, Node.js)",
      "Expérience en gestion de projet agile",
      "Excellentes compétences en communication",
    ],
    improvements: [
      "Ajouter des certifications professionnelles",
      "Détailler davantage les projets réalisés",
      "Inclure des chiffres et résultats mesurables",
      "Mettre à jour la section formation",
    ],
    score: 85,
  };

  const matchedJobs = [
    {
      id: "1",
      title: "Développeur Full Stack Senior",
      company: "Tech Solutions CI",
      location: "Abidjan, Plateau",
      salary: "1,000,000 - 1,500,000 FCFA",
      matchScore: 95,
      type: "CDI",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      postedAt: "Il y a 2 jours",
    },
    {
      id: "2",
      title: "Lead Developer",
      company: "Digital Innovations",
      location: "Abidjan, Cocody",
      salary: "1,200,000 - 1,800,000 FCFA",
      matchScore: 88,
      type: "CDI",
      skills: ["React", "Next.js", "Node.js", "Docker"],
      postedAt: "Il y a 5 jours",
    },
    {
      id: "3",
      title: "Développeur Frontend React",
      company: "Creative Agency",
      location: "Abidjan, Marcory",
      salary: "800,000 - 1,200,000 FCFA",
      matchScore: 82,
      type: "CDI",
      skills: ["React", "TypeScript", "Next.js"],
      postedAt: "Il y a 1 semaine",
    },
    {
      id: "4",
      title: "Développeur Backend Node.js",
      company: "API Solutions",
      location: "Abidjan, Zone 4",
      salary: "900,000 - 1,300,000 FCFA",
      matchScore: 78,
      type: "CDD",
      skills: ["Node.js", "PostgreSQL", "Docker"],
      postedAt: "Il y a 1 semaine",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    setAnalyzing(true);
    // Simulation d'analyse
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 3000);
  };

  const getMatchColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-secondary";
    return "text-accent";
  };

  const getMatchBgColor = (score: number) => {
    if (score >= 85) return "bg-success";
    if (score >= 70) return "bg-secondary";
    return "bg-accent";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {!analyzed ? (
          /* Upload Section */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-heading font-bold text-text mb-4">
                Analyse de CV Intelligente
              </h1>
              <p className="text-lg text-grayDark max-w-2xl mx-auto">
                Téléchargez votre CV pour obtenir une analyse détaillée et découvrir les emplois qui correspondent le mieux à votre profil
              </p>
            </div>

            {/* Upload Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-grayLight p-8 mb-8">
              <div className="border-2 border-dashed border-grayLight rounded-2xl p-12 text-center hover:border-primary transition-all">
                <Upload className="w-16 h-16 text-grayDark mx-auto mb-4" />
                <h3 className="text-xl font-heading font-bold text-text mb-2">
                  Glissez-déposez votre CV ici
                </h3>
                <p className="text-grayDark mb-4">ou</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-xl cursor-pointer inline-block transition-all">
                    Parcourir les fichiers
                  </span>
                </label>
                <p className="text-sm text-grayDark mt-4">
                  Formats acceptés: PDF, DOC, DOCX (Max. 5MB)
                </p>
              </div>

              {file && (
                <div className="mt-6 p-4 bg-background rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold text-text">{file.name}</p>
                      <p className="text-sm text-grayDark">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-error hover:text-error/80"
                  >
                    Supprimer
                  </button>
                </div>
              )}

              {file && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Analyse en cours...
                    </>
                  ) : (
                    <>Analyser mon CV</>
                  )}
                </button>
              )}
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-text mb-2">
                  Analyse détaillée
                </h3>
                <p className="text-sm text-grayDark">
                  Obtenez un score global et des insights sur vos compétences
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-heading font-bold text-text mb-2">
                  Matching intelligent
                </h3>
                <p className="text-sm text-grayDark">
                  Découvrez les emplois qui correspondent le mieux à votre profil
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-heading font-bold text-text mb-2">
                  Recommandations
                </h3>
                <p className="text-sm text-grayDark">
                  Recevez des conseils pour améliorer votre CV
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-heading font-bold text-text">
                Résultats de l&apos;analyse
              </h1>
              <button
                onClick={() => {
                  setAnalyzed(false);
                  setFile(null);
                }}
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Analyser un autre CV
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - CV Analysis */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6">
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl font-heading font-bold text-primary">
                        {cvAnalysis.score}
                      </span>
                    </div>
                    <h2 className="font-heading font-bold text-2xl text-text mb-1">
                      {cvAnalysis.profile.name}
                    </h2>
                    <p className="text-grayDark mb-2">{cvAnalysis.profile.title}</p>
                    <p className="text-sm text-grayDark">{cvAnalysis.profile.location}</p>
                  </div>

                  <div className="pt-4 border-t border-grayLight space-y-2 text-sm">
                    <p className="text-grayDark">
                      <strong>Expérience:</strong> {cvAnalysis.profile.experience}
                    </p>
                    <p className="text-grayDark">
                      <strong>Email:</strong> {cvAnalysis.profile.email}
                    </p>
                    <p className="text-grayDark">
                      <strong>Téléphone:</strong> {cvAnalysis.profile.phone}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6">
                  <h3 className="font-heading font-bold text-text mb-4">Compétences détectées</h3>
                  <div className="space-y-3">
                    {cvAnalysis.skills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-text">{skill.name}</span>
                          <span className="text-sm text-grayDark">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-grayLight rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="font-heading font-bold text-text">Points forts</h3>
                  </div>
                  <ul className="space-y-2">
                    {cvAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-grayDark">
                        <span className="text-success mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-secondary" />
                    <h3 className="font-heading font-bold text-text">Axes d&apos;amélioration</h3>
                  </div>
                  <ul className="space-y-2">
                    {cvAnalysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-grayDark">
                        <span className="text-secondary mt-1">→</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column - Matched Jobs */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-6 mb-6">
                  <h2 className="text-2xl font-heading font-bold text-text mb-2">
                    Emplois recommandés pour vous
                  </h2>
                  <p className="text-grayDark">
                    Basé sur votre profil, nous avons trouvé {matchedJobs.length} offres correspondant à vos compétences
                  </p>
                </div>

                <div className="space-y-4">
                  {matchedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl shadow-sm border border-grayLight p-6 hover:shadow-lg hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-heading font-bold text-text">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${getMatchBgColor(
                                  job.matchScore
                                )}/10`}
                              >
                                <span
                                  className={`text-sm font-bold ${getMatchColor(
                                    job.matchScore
                                  )}`}
                                >
                                  {job.matchScore}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-grayDark font-semibold mb-3">{job.company}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-grayDark mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{job.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{job.salary}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-grayLight">
                        <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all">
                          Postuler maintenant
                        </button>
                        <button className="px-6 py-3 border border-grayLight text-grayDark rounded-xl font-semibold hover:bg-background transition-all">
                          Voir détails
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

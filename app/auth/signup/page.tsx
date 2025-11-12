"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Briefcase, ArrowRight, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"candidate" | "recruiter" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    position: "",
    sector: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      // Success - redirect to signin
      router.push("/auth/signin?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      type: "candidate" as const,
      icon: User,
      title: "Je cherche un emploi",
      subtitle: "Candidat",
      description: "Créez votre profil, postulez aux offres et gérez vos candidatures",
      features: [
        "Accès à des milliers d'offres",
        "Analyse gratuite de votre CV",
        "Alertes emploi personnalisées",
        "Suivi de vos candidatures",
        "Profil visible par les recruteurs",
      ],
      color: "primary",
      gradient: "from-primary to-[#003d82]",
    },
    {
      type: "recruiter" as const,
      icon: Briefcase,
      title: "Je recrute des talents",
      subtitle: "Recruteur",
      description: "Publiez vos offres, recherchez des candidats et gérez vos recrutements",
      features: [
        "Publication d'offres illimitée",
        "Base de données de candidats",
        "Tri et filtrage des candidatures",
        "Outils de communication",
        "Statistiques de recrutement",
      ],
      color: "accent",
      gradient: "from-accent to-[#c72626]",
    },
  ];

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Link
            href="/auth/signup"
            onClick={() => setSelectedRole(null)}
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6"
          >
            ← Retour au choix
          </Link>

          <div className="bg-white rounded-2xl shadow-xl border border-grayLight p-8">
            <div className="text-center mb-8">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${
                  selectedRole === "candidate" ? "from-primary to-[#003d82]" : "from-accent to-[#c72626]"
                } rounded-2xl mb-4`}
              >
                {selectedRole === "candidate" ? (
                  <User className="w-8 h-8 text-white" />
                ) : (
                  <Briefcase className="w-8 h-8 text-white" />
                )}
              </div>
              <h1 className="text-3xl font-heading font-bold text-text mb-2">
                Inscription {selectedRole === "candidate" ? "Candidat" : "Recruteur"}
              </h1>
              <p className="text-grayDark">Créez votre compte gratuitement</p>
            </div>

            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {selectedRole === "recruiter" && (
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Nom de l&apos;entreprise *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Ex: Tech Solutions CI"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  {selectedRole === "candidate" ? "Nom complet" : "Nom du contact"} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder={selectedRole === "candidate" ? "Ex: Jean Kouadio" : "Ex: Marie Koné"}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Email professionnel *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="+225 07 00 00 00 00"
                />
              </div>

              {selectedRole === "candidate" && (
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Poste recherché
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ex: Développeur Full Stack"
                  />
                </div>
              )}

              {selectedRole === "recruiter" && (
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Secteur d&apos;activité *
                  </label>
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={(e) => handleInputChange(e as any)}
                    className="input-field"
                    required
                  >
                    <option value="">Sélectionnez un secteur</option>
                    <option>Informatique / Tech</option>
                    <option>Marketing / Communication</option>
                    <option>Finance / Banque</option>
                    <option>Commerce / Vente</option>
                    <option>Industrie</option>
                    <option>Services</option>
                    <option>Autre</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Minimum 8 caractères"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Retapez votre mot de passe"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="w-4 h-4 mt-1 accent-primary"
                />
                <label htmlFor="terms" className="text-sm text-grayDark">
                  J&apos;accepte les{" "}
                  <a href="#" className="text-primary hover:underline">
                    conditions d&apos;utilisation
                  </a>{" "}
                  et la{" "}
                  <a href="#" className="text-primary hover:underline">
                    politique de confidentialité
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${
                  selectedRole === "candidate" ? "from-primary to-[#003d82]" : "from-accent to-[#c72626]"
                } hover:opacity-90 text-white font-semibold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Création en cours..." : "Créer mon compte"}
              </button>
            </form>

            <p className="text-center text-sm text-grayDark mt-6">
              Vous avez déjà un compte ?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline font-semibold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
          <Briefcase className="w-6 h-6" />
          <span className="font-heading font-bold text-xl">EmploiRapide</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-text mb-4">
            Rejoignez EmploiRapide
          </h1>
          <p className="text-xl text-grayDark">
            Choisissez le type de compte qui correspond à vos besoins
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {roles.map((role) => (
            <div
              key={role.type}
              className="group bg-white rounded-3xl shadow-lg border-2 border-grayLight hover:border-transparent hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Header with Gradient */}
              <div className={`bg-gradient-to-br ${role.gradient} p-8 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-4">
                    <role.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-2">{role.title}</h3>
                  <p className="text-white/90 text-lg">{role.subtitle}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-8">
                <p className="text-grayDark mb-6">{role.description}</p>

                <div className="space-y-3 mb-8">
                  {role.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm text-text">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedRole(role.type)}
                  className={`w-full bg-gradient-to-r ${role.gradient} hover:opacity-90 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-lg`}
                >
                  Choisir {role.subtitle}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-grayDark mt-12">
          Vous avez déjà un compte ?{" "}
          <Link href="/auth/signin" className="text-primary hover:underline font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

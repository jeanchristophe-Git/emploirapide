"use client";

import { useState } from "react";
import { Building2, Camera } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";

interface RecruiterProfileTabProps {
  profileData: any;
  logoPreview: string;
  setLogoPreview: (url: string) => void;
  onProfileUpdate: () => void;
}

export default function RecruiterProfileTab({
  profileData,
  logoPreview,
  setLogoPreview,
  onProfileUpdate
}: RecruiterProfileTabProps) {
  const [saving, setSaving] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Compress and show preview
      const compressed = await compressImage(file);
      setLogoPreview(compressed);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const updateData: any = {
        companyName: formData.get("companyName") as string,
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        website: formData.get("website") as string,
        about: formData.get("about") as string,
      };

      if (logoPreview && logoPreview.startsWith("data:")) {
        updateData.profilePhoto = logoPreview;
      }

      const res = await fetch("/api/recruiter/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      alert("Profil mis à jour avec succès!");
      onProfileUpdate();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-heading font-bold text-text mb-4 md:mb-6">Paramètres</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="flex flex-col items-center pb-6 border-b border-grayLight max-w-full">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-background border-4 border-primary/20">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo entreprise"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <Building2 className="w-16 h-16 text-primary" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-2 cursor-pointer shadow-lg transition-all">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
            </div>
            <p className="text-sm text-grayDark mt-3">
              Logo de l'entreprise - JPG ou PNG, max 2MB
            </p>
            {logoPreview && (
              <button
                type="button"
                onClick={() => setLogoPreview("")}
                className="mt-2 text-sm text-error hover:underline"
              >
                Supprimer le logo
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Nom de l'entreprise *
            </label>
            <input
              type="text"
              name="companyName"
              defaultValue={profileData?.companyName || ""}
              placeholder="Ex: TechCorp CI"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Nom du responsable
            </label>
            <input
              type="text"
              name="name"
              defaultValue={profileData?.name || ""}
              placeholder="Ex: Jean Kouassi"
              className="input-field"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
                Site web
              </label>
              <input
                type="url"
                name="website"
                defaultValue={profileData?.website || ""}
                placeholder="https://www.example.com"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              À propos de l'entreprise
            </label>
            <textarea
              name="about"
              rows={4}
              defaultValue={profileData?.about || ""}
              placeholder="Décrivez votre entreprise, votre activité..."
              className="input-field resize-none"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
}

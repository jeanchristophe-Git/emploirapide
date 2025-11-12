"use client";

import { useState } from "react";
import { Plus, X, Trash2, Briefcase, GraduationCap, Award, Languages } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  level: string; // "débutant" | "intermédiaire" | "avancé" | "expert"
}

interface Language {
  id: string;
  name: string;
  level: string; // "débutant" | "intermédiaire" | "courant" | "natif"
}

interface CandidateEnrichedProfileProps {
  profileData: any;
  onSave: (data: any) => Promise<void>;
}

export default function CandidateEnrichedProfile({ profileData, onSave }: CandidateEnrichedProfileProps) {
  // Parse JSON data from profile
  const [experiences, setExperiences] = useState<Experience[]>(
    profileData?.experiences ? JSON.parse(profileData.experiences) : []
  );
  const [education, setEducation] = useState<Education[]>(
    profileData?.education ? JSON.parse(profileData.education) : []
  );
  const [skills, setSkills] = useState<Skill[]>(
    profileData?.skills ? JSON.parse(profileData.skills) : []
  );
  const [languages, setLanguages] = useState<Language[]>(
    profileData?.languages ? JSON.parse(profileData.languages) : []
  );

  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Experience handlers
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    setExperiences([...experiences, newExp]);
    setActiveSection("experience-" + newExp.id);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  // Education handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: "",
      school: "",
      field: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    setEducation([...education, newEdu]);
    setActiveSection("education-" + newEdu.id);
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setEducation(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  // Skills handlers
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "",
      level: "intermédiaire",
    };
    setSkills([...skills, newSkill]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    setSkills(skills.map(skill => skill.id === id ? { ...skill, [field]: value } : skill));
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  // Languages handlers
  const addLanguage = () => {
    const newLang: Language = {
      id: Date.now().toString(),
      name: "",
      level: "intermédiaire",
    };
    setLanguages([...languages, newLang]);
  };

  const updateLanguage = (id: string, field: keyof Language, value: any) => {
    setLanguages(languages.map(lang => lang.id === id ? { ...lang, [field]: value } : lang));
  };

  const removeLanguage = (id: string) => {
    setLanguages(languages.filter(lang => lang.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        experiences: JSON.stringify(experiences),
        education: JSON.stringify(education),
        skills: JSON.stringify(skills),
        languages: JSON.stringify(languages),
      });
      alert("Profil mis à jour avec succès!");
    } catch (error: any) {
      alert(error.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Expériences professionnelles */}
      <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-heading font-bold text-text flex items-center gap-2">
            <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
            Expériences professionnelles
          </h3>
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {experiences.length === 0 ? (
          <p className="text-grayDark text-center py-8">
            Aucune expérience ajoutée. Cliquez sur "Ajouter" pour commencer.
          </p>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="border border-grayLight rounded-xl p-4 relative">
                <button
                  type="button"
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-2 right-2 p-1 text-error hover:bg-error/10 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1">Poste *</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                      className="input-field text-sm"
                      placeholder="Ex: Développeur Full Stack"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1">Entreprise *</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      className="input-field text-sm"
                      placeholder="Ex: TechCorp CI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1">Localisation</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                      className="input-field text-sm"
                      placeholder="Ex: Abidjan, Côte d'Ivoire"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1">Date de début *</label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1">Date de fin</label>
                    <input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                      disabled={exp.current}
                      className="input-field text-sm disabled:bg-grayLight disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <label htmlFor={`current-${exp.id}`} className="text-sm text-grayDark cursor-pointer">
                      Je travaille actuellement ici
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-text mb-1">Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                    className="input-field text-sm resize-none"
                    rows={3}
                    placeholder="Décrivez vos missions et réalisations..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formation */}
      <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-heading font-bold text-text flex items-center gap-2">
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
            Formation
          </h3>
          <button
            type="button"
            onClick={addEducation}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {education.length === 0 ? (
          <p className="text-grayDark text-center py-8">
            Aucune formation ajoutée. Cliquez sur "Ajouter" pour commencer.
          </p>
        ) : (
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="border border-grayLight rounded-xl p-4 relative">
                <button
                  type="button"
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-2 right-2 p-1 text-error hover:bg-error/10 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1">Diplôme *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      className="input-field text-sm"
                      placeholder="Ex: Master en Informatique"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1">École/Université *</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                      className="input-field text-sm"
                      placeholder="Ex: INPHB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1">Domaine d'étude</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                      className="input-field text-sm"
                      placeholder="Ex: Génie Logiciel"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-1">Début</label>
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-1">Fin</label>
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-text mb-1">Description</label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                    className="input-field text-sm resize-none"
                    rows={2}
                    placeholder="Mention, projets, etc..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compétences */}
      <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-heading font-bold text-text flex items-center gap-2">
            <Award className="w-5 h-5 md:w-6 md:h-6" />
            Compétences
          </h3>
          <button
            type="button"
            onClick={addSkill}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {skills.length === 0 ? (
          <p className="text-grayDark text-center py-8">
            Aucune compétence ajoutée. Cliquez sur "Ajouter" pour commencer.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-2 border border-grayLight rounded-lg p-3">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                    className="input-field text-sm"
                    placeholder="Ex: React.js"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) => updateSkill(skill.id, "level", e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="avancé">Avancé</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors flex-shrink-0"
                  title="Supprimer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Langues */}
      <div className="bg-white rounded-2xl shadow-sm border border-grayLight p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-heading font-bold text-text flex items-center gap-2">
            <Languages className="w-5 h-5 md:w-6 md:h-6" />
            Langues
          </h3>
          <button
            type="button"
            onClick={addLanguage}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {languages.length === 0 ? (
          <p className="text-grayDark text-center py-8">
            Aucune langue ajoutée. Cliquez sur "Ajouter" pour commencer.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {languages.map((lang) => (
              <div key={lang.id} className="flex items-center gap-2 border border-grayLight rounded-lg p-3">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={lang.name}
                    onChange={(e) => updateLanguage(lang.id, "name", e.target.value)}
                    className="input-field text-sm"
                    placeholder="Ex: Français"
                  />
                  <select
                    value={lang.level}
                    onChange={(e) => updateLanguage(lang.id, "level", e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="courant">Courant</option>
                    <option value="natif">Natif</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeLanguage(lang.id)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors flex-shrink-0"
                  title="Supprimer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8"
        >
          {saving ? "Enregistrement..." : "Enregistrer le profil"}
        </button>
      </div>
    </div>
  );
}

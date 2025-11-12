import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Fonction utilitaire pour fusionner les classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fonction de formatage de date
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Fonction de formatage de salaire
export function formatSalary(min: number, max?: number): string {
  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  });

  if (max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  return formatter.format(min);
}

// Fonction de calcul du score de matching entre CV et offre
export function calculateMatchScore(
  cvKeywords: string[],
  jobKeywords: string[]
): number {
  if (cvKeywords.length === 0 || jobKeywords.length === 0) return 0;

  const cvSet = new Set(cvKeywords.map((k) => k.toLowerCase()));
  const jobSet = new Set(jobKeywords.map((k) => k.toLowerCase()));

  let matches = 0;
  jobSet.forEach((keyword) => {
    if (cvSet.has(keyword)) matches++;
  });

  return Math.round((matches / jobSet.size) * 100);
}

// Extraction de mots-clés d'un texte
export function extractKeywords(text: string): string[] {
  // Mots-clés techniques et professionnels à rechercher
  const keywords = [
    // Langages de programmation
    "javascript",
    "typescript",
    "python",
    "java",
    "php",
    "c#",
    "ruby",
    "go",
    "rust",
    "swift",
    "kotlin",
    // Frameworks
    "react",
    "vue",
    "angular",
    "nextjs",
    "express",
    "django",
    "flask",
    "spring",
    "laravel",
    // Compétences
    "html",
    "css",
    "sql",
    "nosql",
    "mongodb",
    "postgresql",
    "mysql",
    "git",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    // Soft skills
    "gestion",
    "management",
    "leadership",
    "communication",
    "marketing",
    "vente",
    "commercial",
    "comptabilité",
    "finance",
    "rh",
    "ressources humaines",
  ];

  const textLower = text.toLowerCase();
  const found: string[] = [];

  keywords.forEach((keyword) => {
    if (textLower.includes(keyword)) {
      found.push(keyword);
    }
  });

  return [...new Set(found)]; // Enlever les doublons
}

// Fonction de truncate
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}

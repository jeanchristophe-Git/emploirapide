import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "emploi";
  const location = searchParams.get("location") || "Côte d'Ivoire";
  const page = searchParams.get("page") || "1";
  const employmentType = searchParams.get("type");
  const source = searchParams.get("source") || "all"; // all, local, external

  try {
    let localJobs: any[] = [];
    let externalJobs: any[] = [];

    // 1. Récupérer les emplois locaux si demandé
    if (source === "all" || source === "local") {
      console.log("🔍 Fetching local jobs...");

      const whereClause: any = {
        status: "active",
      };

      // Filtrer par query (titre, description, entreprise)
      if (query && query !== "emploi") {
        whereClause.OR = [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { company: { contains: query, mode: "insensitive" } },
        ];
      }

      // Filtrer par type de contrat
      if (employmentType && employmentType !== "all") {
        whereClause.contract_type = employmentType;
      }

      const localJobsFromDB = await prisma.job.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              companyName: true,
              profilePhoto: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      });

      // Transformer les emplois locaux au même format que JSearch
      localJobs = localJobsFromDB.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.contract_type,
        salary: job.salary_min && job.salary_max
          ? `${job.salary_min} - ${job.salary_max} FCFA`
          : "Salaire non spécifié",
        postedAt: new Date(job.createdAt).toLocaleDateString("fr-FR"),
        description: job.description,
        logo: job.user?.profilePhoto || null,
        applyLink: null, // Pas de lien externe pour emplois locaux
        qualifications: [],
        responsibilities: [],
        requirements: job.requirements,
        isLocal: true, // Flag pour identifier les emplois locaux
        applicationCount: job._count.applications,
      }));

      console.log(`✅ Found ${localJobs.length} local jobs`);
    }

    // 2. Récupérer les emplois externes (JSearch) si demandé
    if (source === "all" || source === "external") {
      const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

      if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "your-rapidapi-key-here") {
        console.log("⚠️ JSearch API key not configured, skipping external jobs");
      } else {
        console.log("🔍 Fetching external jobs from JSearch...");

        const options = {
          method: "GET",
          url: "https://jsearch.p.rapidapi.com/search",
          params: {
            query: `${query} in ${location}`,
            page: page,
            num_pages: "1",
            date_posted: "all",
            ...(employmentType && employmentType !== "all" && { employment_types: employmentType.toUpperCase() }),
          },
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
        };

        console.log("🔍 JSearch API Request:", options.params);

        const response = await axios.request(options);

        console.log("✅ JSearch API Response status:", response.status);
        console.log("📊 External jobs found:", response.data.data?.length || 0);

        if (response.data.data && response.data.data.length > 0) {
          externalJobs = response.data.data.map((job: any) => ({
            id: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city || job.job_country || location,
            type: job.job_employment_type || "Full-time",
            salary: job.job_salary || job.job_min_salary
              ? `${job.job_min_salary || "N/A"} - ${job.job_max_salary || "N/A"} ${job.job_salary_currency || ""}`.trim()
              : "Salaire non spécifié",
            postedAt: job.job_posted_at_datetime_utc
              ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString("fr-FR")
              : "Date non spécifiée",
            description: job.job_description || "Description non disponible",
            logo: job.employer_logo,
            applyLink: job.job_apply_link,
            qualifications: job.job_highlights?.Qualifications || [],
            responsibilities: job.job_highlights?.Responsibilities || [],
            isLocal: false, // Flag pour identifier les emplois externes
          }));
        }
      }
    }

    // 3. Combiner et retourner les résultats
    const allJobs = [...localJobs, ...externalJobs];

    console.log(`📊 Total jobs: ${allJobs.length} (${localJobs.length} local + ${externalJobs.length} external)`);

    return NextResponse.json({
      jobs: allJobs,
      total: allJobs.length,
      local: localJobs.length,
      external: externalJobs.length,
    });
  } catch (error) {
    console.error("❌ Job search error:", error);

    if (axios.isAxiosError(error)) {
      console.error("API Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      if (error.response?.status === 429) {
        return NextResponse.json(
          { error: "Limite de requêtes atteinte. Veuillez réessayer plus tard." },
          { status: 429 }
        );
      }

      if (error.response?.status === 401) {
        return NextResponse.json(
          { error: "Clé API invalide. Veuillez vérifier votre configuration." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: "Erreur lors de la récupération des offres.",
          details: error.response?.data || error.message
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

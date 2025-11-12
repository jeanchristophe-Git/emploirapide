import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les détails d'une offre d'emploi spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    // Récupérer le job depuis la base de données
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        user: {
          select: {
            companyName: true,
            name: true,
            profilePhoto: true,
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    // Si le job n'existe pas
    if (!job) {
      return NextResponse.json(
        { error: "Offre d'emploi non trouvée" },
        { status: 404 }
      );
    }

    // Formater les données pour le frontend
    const formattedJob = {
      id: job.id,
      title: job.title,
      company: job.company,
      companyLogo: job.user.profilePhoto,
      location: job.location,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary_min && job.salary_max
        ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} FCFA`
        : job.salary_min
          ? `À partir de ${job.salary_min.toLocaleString()} FCFA`
          : "Salaire non spécifié",
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      contract_type: job.contract_type,
      category: job.category,
      postedAt: job.createdAt,
      applicationsCount: job._count.applications,
      isLocal: true
    };

    return NextResponse.json({ job: formattedJob });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des détails de l'offre" },
      { status: 500 }
    );
  }
}

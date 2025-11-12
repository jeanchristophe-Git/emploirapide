import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "15");

    // Get published jobs from local database
    const jobs = await prisma.job.findMany({
      where: {
        status: "active"
      },
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
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });

    // Format jobs for frontend
    const formattedJobs = jobs.map(job => ({
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
      isLocal: true // Flag to identify local jobs
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      total: formattedJobs.length
    });
  } catch (error) {
    console.error("Error fetching published jobs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres" },
      { status: 500 }
    );
  }
}

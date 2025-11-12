import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les emplois sauvegardés de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: session.user.id },
      orderBy: { savedAt: "desc" },
    });

    // Parse jobData from JSON string
    const jobs = savedJobs.map((saved) => ({
      ...JSON.parse(saved.jobData),
      savedAt: saved.savedAt,
      savedJobId: saved.id,
    }));

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des emplois sauvegardés" },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder un emploi
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobId, jobData } = body;

    if (!jobId || !jobData) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Check if already saved
    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId: jobId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Emploi déjà sauvegardé" },
        { status: 400 }
      );
    }

    const savedJob = await prisma.savedJob.create({
      data: {
        userId: session.user.id,
        jobId: jobId,
        jobData: JSON.stringify(jobData),
      },
    });

    return NextResponse.json({
      message: "Emploi sauvegardé avec succès",
      savedJob
    });
  } catch (error) {
    console.error("Error saving job:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde de l'emploi" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un emploi sauvegardé
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "ID de l'emploi manquant" },
        { status: 400 }
      );
    }

    await prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId: jobId,
        },
      },
    });

    return NextResponse.json({
      message: "Emploi retiré des favoris avec succès"
    });
  } catch (error) {
    console.error("Error deleting saved job:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

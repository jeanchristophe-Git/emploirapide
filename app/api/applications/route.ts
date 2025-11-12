import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer toutes les candidatures de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = session.user.role;

    if (role === "candidate") {
      // Candidat : ses candidatures
      const applications = await prisma.application.findMany({
        where: { userId: session.user.id },
        include: {
          job: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ applications });
    } else if (role === "recruiter") {
      // Recruteur : candidatures sur ses offres
      const applications = await prisma.application.findMany({
        where: {
          job: {
            userId: session.user.id,
          },
        },
        include: {
          job: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              city: true,
              address: true,
              about: true,
              profilePhoto: true,
              experiences: true,
              education: true,
              skills: true,
              languages: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ applications });
    }

    return NextResponse.json({ applications: [] });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des candidatures" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle candidature
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
    const { jobId, coverLetter } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "ID de l'emploi manquant" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Emploi non trouvé" },
        { status: 404 }
      );
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        jobId: jobId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Vous avez déjà postulé à cette offre" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobId: jobId,
        coverLetter: coverLetter || null,
        status: "pending",
      },
    });

    return NextResponse.json({
      message: "Candidature envoyée avec succès",
      application,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la candidature" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut d'une candidature (recruteur uniquement)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "recruiter") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Verify the application belongs to recruiter's job
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application || application.job.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Candidature non trouvée" },
        { status: 404 }
      );
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    return NextResponse.json({
      message: "Statut mis à jour avec succès",
      application: updated,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

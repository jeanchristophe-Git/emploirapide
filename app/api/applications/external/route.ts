import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les candidatures externes du candidat
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const externalApplications = await prisma.externalApplication.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    // Parser jobData pour chaque candidature
    const applications = externalApplications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      ...JSON.parse(app.jobData),
      status: app.status,
      appliedAt: app.appliedAt,
    }));

    return NextResponse.json({
      applications,
    });
  } catch (error) {
    console.error("Error fetching external applications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des candidatures" },
      { status: 500 }
    );
  }
}

// POST - Enregistrer une candidature externe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobId, jobData } = body;

    if (!jobId || !jobData) {
      return NextResponse.json(
        { error: "jobId et jobData sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si déjà candidaté
    const existing = await prisma.externalApplication.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId: jobId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Vous avez déjà postulé à cette offre" },
        { status: 400 }
      );
    }

    // Créer la candidature externe
    const application = await prisma.externalApplication.create({
      data: {
        userId: session.user.id,
        jobId: jobId,
        jobData: typeof jobData === "string" ? jobData : JSON.stringify(jobData),
        status: "applied",
      },
    });

    return NextResponse.json({
      message: "Candidature enregistrée avec succès",
      application,
    });
  } catch (error) {
    console.error("Error creating external application:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de la candidature" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut d'une candidature externe
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "applicationId et status sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que la candidature appartient à l'utilisateur
    const application = await prisma.externalApplication.findFirst({
      where: {
        id: applicationId,
        userId: session.user.id,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Candidature non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour le statut
    const updated = await prisma.externalApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      message: "Statut mis à jour",
      application: updated,
    });
  } catch (error) {
    console.error("Error updating external application:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

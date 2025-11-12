import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer toutes les offres du recruteur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "recruiter") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const jobs = await prisma.job.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle offre d'emploi
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "recruiter") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      company,
      location,
      description,
      requirements,
      salary_min,
      salary_max,
      contract_type,
      category,
      keywords,
      status,
    } = body;

    if (!title || !company || !location || !description || !contract_type || !category) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        title,
        company,
        location,
        description,
        requirements: requirements || null,
        salary_min: salary_min ? parseInt(salary_min) : null,
        salary_max: salary_max ? parseInt(salary_max) : null,
        contract_type,
        category,
        keywords: JSON.stringify(keywords || []),
        status: status || "active",
      },
    });

    return NextResponse.json({
      message: "Offre créée avec succès",
      job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'offre" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une offre d'emploi
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de l'offre manquant" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob || existingJob.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Offre non trouvée" },
        { status: 404 }
      );
    }

    // Update keywords if provided
    if (updateData.keywords) {
      updateData.keywords = JSON.stringify(updateData.keywords);
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Offre mise à jour avec succès",
      job,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une offre d'emploi
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "recruiter") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de l'offre manquant" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob || existingJob.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Offre non trouvée" },
        { status: 404 }
      );
    }

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Offre supprimée avec succès",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

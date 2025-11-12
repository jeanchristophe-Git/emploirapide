import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST - Upload CV
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
    const { cvFile, filename } = body;

    if (!cvFile || !filename) {
      return NextResponse.json(
        { error: "Fichier CV manquant" },
        { status: 400 }
      );
    }

    try {
      // Upload PDF to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(cvFile, {
        folder: "emploirapide/cvs",
        public_id: `cv_${session.user.id}_${Date.now()}`,
        resource_type: "raw",
        format: "pdf",
      });

      // Create CV record in database
      const cv = await prisma.cV.create({
        data: {
          userId: session.user.id,
          filename: filename,
          content: uploadResult.secure_url,
          keywords: JSON.stringify([]), // Can be populated later with AI analysis
        },
      });

      return NextResponse.json({
        message: "CV téléchargé avec succès",
        cv: {
          id: cv.id,
          filename: cv.filename,
          url: uploadResult.secure_url,
          uploadedAt: cv.uploadedAt,
        },
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: "Erreur lors de l'upload du CV" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading CV:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement du CV" },
      { status: 500 }
    );
  }
}

// GET - Récupérer tous les CVs de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const cvs = await prisma.cV.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        filename: true,
        content: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({ cvs });
  } catch (error) {
    console.error("Error fetching CVs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des CVs" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un CV
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
    const cvId = searchParams.get("id");

    if (!cvId) {
      return NextResponse.json(
        { error: "ID du CV manquant" },
        { status: 400 }
      );
    }

    // Verify CV belongs to user
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
    });

    if (!cv || cv.userId !== session.user.id) {
      return NextResponse.json(
        { error: "CV non trouvé" },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.cV.delete({
      where: { id: cvId },
    });

    // Note: You may also want to delete from Cloudinary here
    // Extract public_id from the URL and call cloudinary.uploader.destroy()

    return NextResponse.json({
      message: "CV supprimé avec succès",
    });
  } catch (error) {
    console.error("Error deleting CV:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du CV" },
      { status: 500 }
    );
  }
}

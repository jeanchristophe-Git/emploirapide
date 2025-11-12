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

// GET - Récupérer le profil du recruteur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "recruiter") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        profilePhoto: true,
        phone: true,
        address: true,
        city: true,
        about: true,
        companyName: true,
        website: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le profil du recruteur
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
    const { name, phone, address, city, about, companyName, website, profilePhoto } = body;

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (about !== undefined) updateData.about = about;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (website !== undefined) updateData.website = website;

    // Handle logo upload if provided
    if (profilePhoto && profilePhoto.startsWith("data:")) {
      try {
        const uploadResult = await cloudinary.uploader.upload(profilePhoto, {
          folder: "emploirapide/company-logos",
          public_id: `company_${session.user.id}`,
          overwrite: true,
          resource_type: "image",
        });
        updateData.profilePhoto = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return NextResponse.json(
          { error: "Erreur lors de l'upload du logo" },
          { status: 500 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        profilePhoto: true,
        phone: true,
        address: true,
        city: true,
        about: true,
        companyName: true,
        website: true,
      },
    });

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// type CardInput = {
//   id?: number;
//   title?: string;
//   description?: string;
//   imageUrl?: string;
// };

// type SectionInput = {
//   sectionKey: string;
//   title?: string;
//   subtitle?: string;
//   description?: string;
//   imageUrl?: string;
//   cards?: CardInput[];
// };

// // =====================================
// // GET: Load page data
// // =====================================

// export async function GET(
//   request: Request,
//   context: { params: Promise<{ page: string }> },
// ) {
//   try {
//     const { page } = await context.params;

//     const sections = await prisma.pageSectionEditable.findMany({
//       where: {
//         page,
//         deletedAt: null,
//         isActive: true,
//       },
//       include: {
//         cards: {
//           where: {
//             deletedAt: null,
//             isActive: true,
//           },
//           orderBy: {
//             sortOrder: "asc",
//           },
//         },
//       },
//       orderBy: {
//         id: "asc",
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       data: sections,
//     });
//   } catch (error) {
//     console.error("GET PAGE ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to load page data",
//       },
//       { status: 500 },
//     );
//   }
// }

// // =====================================
// // PUT: Save page data
// // =====================================

// export async function PUT(
//   request: Request,
//   context: { params: Promise<{ page: string }> },
// ) {
//   try {
//     const { page } = await context.params;
//     const body = await request.json();

//     if (!Array.isArray(body.sections)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid sections data",
//         },
//         { status: 400 },
//       );
//     }

//     await prisma.$transaction(async (tx) => {
//       for (const section of body.sections as SectionInput[]) {
//         if (!section.sectionKey) {
//           throw new Error("Section key is required");
//         }

//         const sectionData = {
//           title: section.title || "",
//           subtitle: section.subtitle || "",
//           description: section.description || "",
//           imageUrl: section.imageUrl || "",
//           isActive: true,
//           deletedAt: null,
//         };

//         // Find existing section
//         const existingSection = await tx.pageSectionEditable.findFirst({
//           where: {
//             page,
//             sectionKey: section.sectionKey,
//           },
//         });

//         let savedSection;

//         // Update or create section
//         if (existingSection) {
//           savedSection = await tx.pageSectionEditable.update({
//             where: {
//               id: existingSection.id,
//             },
//             data: sectionData,
//           });
//         } else {
//           savedSection = await tx.pageSectionEditable.create({
//             data: {
//               page,
//               sectionKey: section.sectionKey,
//               ...sectionData,
//             },
//           });
//         }

//         const cards = section.cards || [];

//         // Find current active cards
//         const existingCards = await tx.cardItem.findMany({
//           where: {
//             sectionId: savedSection.id,
//             deletedAt: null,
//             isActive: true,
//           },
//         });

//         // Get IDs of cards still submitted from frontend
//         const submittedIds = cards
//           .filter((card) => card.id !== undefined)
//           .map((card) => Number(card.id));

//         // Find cards removed from frontend
//         const deletedIds = existingCards
//           .filter((card) => !submittedIds.includes(card.id))
//           .map((card) => card.id);

//         // Soft delete removed cards
//         if (deletedIds.length > 0) {
//           await tx.cardItem.updateMany({
//             where: {
//               id: {
//                 in: deletedIds,
//               },
//               sectionId: savedSection.id,
//             },
//             data: {
//               deletedAt: new Date(),
//               isActive: false,
//             },
//           });
//         }

//         // Create or update submitted cards
//         for (let index = 0; index < cards.length; index++) {
//           const card = cards[index];

//           const cardData = {
//             type: section.sectionKey,
//             title: card.title || "",
//             description: card.description || "",
//             imageUrl: card.imageUrl || "",
//             sortOrder: index,
//             isActive: true,
//             deletedAt: null,
//           };

//           if (card.id !== undefined) {
//             // Check whether this card belongs to this section
//             const existingCard = existingCards.find(
//               (item) => item.id === Number(card.id),
//             );

//             if (!existingCard) {
//               throw new Error(
//                 `Card ID ${card.id} does not belong to section ${section.sectionKey}`,
//               );
//             }

//             await tx.cardItem.update({
//               where: {
//                 id: existingCard.id,
//               },
//               data: cardData,
//             });
//           } else {
//             // Create new card
//             await tx.cardItem.create({
//               data: {
//                 sectionId: savedSection.id,
//                 ...cardData,
//               },
//             });
//           }
//         }
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Home page saved successfully",
//     });
//   } catch (error) {
//     console.error("PUT PAGE ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error instanceof Error ? error.message : "Failed to save page data",
//       },
//       { status: 500 },
//     );
//   }
// }
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { RouteContext } from "@/types/routes";
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { page } = await params;

    // RBAC: Required permission = home:read or about:read
    const requiredPermission = `${page}:read`;
    const sections = await prisma.pageSectionEditable.findMany({
      where: {
        page: page,
        deletedAt: null,
        isActive: true,
      },
      include: {
        cards: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
    return NextResponse.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error("GET PAGE ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to load page data",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    console.log("PUT API CALLED");
    const body = await request.json();
    const UpdateSections = await prisma.$transaction(
      body.sections.map((section: any) => {
        return prisma.pageSectionEditable.update({
          where: {
            id: Number(section.id),
          },
          data: {
            title: section.title,
            subtitle: section.subtitle,
            description: section.description,
            imageUrl: section.imageUrl,
          },
        });
      }),
    );
    return NextResponse.json({
      success: true,
      message: "Home page saved successfully",
      data: UpdateSections,
    });
  } catch (error) {
    console.error("PUT PAGE ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to save page data",
      },
      { status: 500 },
    );
  }
}

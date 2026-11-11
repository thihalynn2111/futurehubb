import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
type RouteContext = { params: Promise<{ page: string }> };
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
    const seo = await prisma.seoPage.findUnique({
      where: {
        pageName: page,
      },
    });
    return NextResponse.json({
      success: true,
      data: sections,
      seo: seo,
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

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    console.log("PUT API CALLED");

    const { page } = await params;
    const body = await request.json();

    if (!Array.isArray(body.sections)) {
      return NextResponse.json(
        {
          success: false,
          message: "Sections must be an array",
        },
        { status: 400 },
      );
    }

    const updatedSections = await prisma.$transaction(async (tx) => {
      // Loop through all sections
      for (const section of body.sections) {
        if (!section.sectionKey) {
          throw new Error("Section key is required");
        }

        // 1. Find existing section
        let savedSection = await tx.pageSectionEditable.findFirst({
          where: {
            page: page,
            sectionKey: section.sectionKey,
            deletedAt: null,
          },
        });

        // 2. Update existing section
        if (savedSection) {
          savedSection = await tx.pageSectionEditable.update({
            where: {
              id: savedSection.id,
            },
            data: {
              title: section.title ?? null,
              subtitle: section.subtitle ?? null,
              description: section.description ?? null,
              imageUrl: section.imageUrl ?? null,
            },
          });
        } else {
          // 3. Create new section
          savedSection = await tx.pageSectionEditable.create({
            data: {
              page: page,
              sectionKey: section.sectionKey,
              title: section.title ?? null,
              subtitle: section.subtitle ?? null,
              description: section.description ?? null,
              imageUrl: section.imageUrl ?? null,
              isActive: true,
            },
          });
        }

        // 4. Save cards
        if (Array.isArray(section.cards)) {
          for (let index = 0; index < section.cards.length; index++) {
            const card = section.cards[index];

            const cardData = {
              type: card.type ?? section.sectionKey,
              title: card.title ?? null,
              description: card.description ?? null,
              imageUrl: card.imageUrl ?? null,
              sortOrder: index,
              isActive: true,
              deletedAt: null,
            };

            // 5. Update existing card
            if (card.id) {
              const existingCard = await tx.cardItem.findFirst({
                where: {
                  id: Number(card.id),
                  sectionId: savedSection.id,
                  deletedAt: null,
                },
              });

              if (!existingCard) {
                throw new Error(`Card ${card.id} not found in this section`);
              }

              await tx.cardItem.update({
                where: {
                  id: existingCard.id,
                },
                data: cardData,
              });
            } else {
              // 6. Create new card
              await tx.cardItem.create({
                data: {
                  ...cardData,
                  sectionId: savedSection.id,
                },
              });
            }
          }
        }
      }

      // 7. Get updated sections with cards
      const result = await tx.pageSectionEditable.findMany({
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

      return result;
    });

    return NextResponse.json({
      success: true,
      message: "Sections and cards saved successfully",
      data: updatedSections,
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

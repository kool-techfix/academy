import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/auth/auth-guard";

export async function GET() {
  try {
    const instructor = await requireInstructor();

    const user = await prisma.user.findUnique({
      where: {
        id: instructor.id,
      },

      select: {
        id: true,
        name: true,
        email: true,
        expertise: true,
        authMethod: true,

        courseUpdatesNotification: true,
        learnerActivityNotification: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Instructor not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      data: {
        id: user.id,

        name: user.name,

        email: user.email,

        expertise: user.expertise,

        authMethod: user.authMethod,

        notifications: {
          courseUpdates: user.courseUpdatesNotification,

          learnerActivity: user.learnerActivityNotification,
        },
      },
    });
  } catch (error) {
    console.error("GET instructor settings error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch instructor settings";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const instructor = await requireInstructor();

    const body = await request.json();

    const {
      name,
      expertise,
      courseUpdatesNotification,
      learnerActivityNotification,
    } = body;

    const updatedUser = await prisma.user.update({
      where: {
        id: instructor.id,
      },

      data: {
        ...(name !== undefined && {
          name: name.trim(),
        }),

        ...(expertise !== undefined && {
          expertise: expertise?.trim() || null,
        }),

        ...(courseUpdatesNotification !== undefined && {
          courseUpdatesNotification,
        }),

        ...(learnerActivityNotification !== undefined && {
          learnerActivityNotification,
        }),
      },

      select: {
        id: true,
        name: true,
        email: true,
        expertise: true,
        authMethod: true,

        courseUpdatesNotification: true,
        learnerActivityNotification: true,
      },
    });

    return NextResponse.json({
      message: "Instructor settings updated successfully",

      data: {
        id: updatedUser.id,

        name: updatedUser.name,

        email: updatedUser.email,

        expertise: updatedUser.expertise,

        authMethod: updatedUser.authMethod,

        notifications: {
          courseUpdates: updatedUser.courseUpdatesNotification,

          learnerActivity: updatedUser.learnerActivityNotification,
        },
      },
    });
  } catch (error) {
    console.error("PATCH instructor settings error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update instructor settings";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      },
    );
  }
}

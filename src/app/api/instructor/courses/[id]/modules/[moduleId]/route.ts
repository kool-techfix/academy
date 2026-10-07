
import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { lessonErrorStatus } from "@/lib/storage/errors";
import { ModuleService } from "@/Services/ModuleService";

const moduleService = new ModuleService();

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      moduleId: string;
    }>;
  },
) {
  try {
    const instructor = await requireInstructor();

    const { id, moduleId } =
      await params;

    const courseModule =
      await moduleService.getModule(instructor.id, id, moduleId);

    return NextResponse.json(courseModule);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch module";

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      moduleId: string;
    }>;
  },
) {
  try {
    const instructor =
      await requireInstructor();

    const { moduleId } =
      await params;

    const body = await request.json();

    const courseModule =
      await moduleService.updateModule(
        instructor.id,
        moduleId,
        {
          title: body.title,
          order: body.order,
        },
      );

    return NextResponse.json(courseModule);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update module";

    return NextResponse.json(
      { message },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      moduleId: string;
    }>;
  },
) {
  try {
    const instructor =
      await requireInstructor();

    const { moduleId } =
      await params;

    await moduleService.deleteModule(
      instructor.id,
      moduleId,
    );

    return NextResponse.json({
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("DELETE module error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete module";

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
  }
}
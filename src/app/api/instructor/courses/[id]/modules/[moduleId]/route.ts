import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { ModuleService } from "@/Services/ModuleService";

const moduleService = new ModuleService();

export async function GET(
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
    await requireInstructor();

    const { moduleId } =
      await params;

    const module =
      await moduleService.getModule(moduleId);

    return NextResponse.json(module);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch module";

    return NextResponse.json(
      { message },
      { status: 400 },
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

    const module =
      await moduleService.updateModule(
        instructor.id,
        moduleId,
        {
          title: body.title,
          order: body.order,
        },
      );

    return NextResponse.json(module);
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
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete module";

    return NextResponse.json(
      { message },
      { status: 400 },
    );
  }
}
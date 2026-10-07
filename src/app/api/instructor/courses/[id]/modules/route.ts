
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
    }>;
  },
) {
  try {
    // Includes quiz answers: approved course authors only.
    const instructor = await requireInstructor();

    const { id } = await params;

    const modules =
      await moduleService.getCourseModules(instructor.id, id);

    return NextResponse.json(modules);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch modules";

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
  }
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const instructor =
      await requireInstructor();

    const { id } = await params;

    const body = await request.json();

    const courseModule =
      await moduleService.createModule(
        instructor.id,
        id,
        {
          title: body.title,
        },
      );

    return NextResponse.json(
      courseModule,
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create module";

    return NextResponse.json(
      { message },
      { status: 400 },
    );
  }
}
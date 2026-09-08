"use client";

import { useState } from "react";
import { Page } from "@/components/page-shell";
import { Button, Badge } from "@/components/academy-ui";
import {
  useInstructorCourse,
  usePublishCourse,
  useUnpublishCourse,
} from "@/hooks/instructor/use-courses";
import { ChevronLeft, Plus } from "lucide-react";
import { ModuleList } from "@/components/instructor/module-list";
import { FinalAssessmentEditor } from "@/components/instructor/final-assessment-editor";
import { ModuleFormModal } from "@/components/instructor/module-form-modal";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LoadingScreen } from "@/components/Loader";
import { useCreateModule } from "@/hooks/instructor/use-modules";

export default function CourseEdit() {
  const { id } = useParams<{ id: string }>();

  const courseId = id;
  const [addingModule, setAddingModule] = useState(false);
  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useInstructorCourse(courseId);

  const publishCourse = usePublishCourse();
  const unpublishCourse = useUnpublishCourse();

  const createModule = useCreateModule();

  if (isLoading) {
    return (
      <Page>
        <div style={{ maxWidth: 900, margin: "24px auto" }}>
          <div className="card empty-state">
            <LoadingScreen message="Loading course..." />
          </div>
        </div>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <div style={{ maxWidth: 900, margin: "24px auto" }}>
          <div className="card empty-state">
            <h2>Unable to load course</h2>

            <p>
              {error instanceof Error
                ? error.message
                : "Something went wrong while loading this course."}
            </p>
          </div>
        </div>
      </Page>
    );
  }

  if (!course) {
    return (
      <Page>
        <div className="not-found">
          <h2>Course not found</h2>
        </div>
      </Page>
    );
  }

  const handlePublishToggle = async () => {
    try {
      if (course.status === "PUBLISHED") {
        await unpublishCourse.mutateAsync(course.id);
      } else {
        await publishCourse.mutateAsync(course.id);
      }
    } catch (error) {
      console.error("Failed to update course status:", error);
    }
  };

  const isPublished = course.status === "PUBLISHED";

  const displayStatus = isPublished ? "Published" : "Draft";

  const nextOrder =
    course.modules.length > 0
      ? Math.max(...course.modules.map((m) => m.order)) + 1
      : 1;

  const handleSaveNewModule = async (data: { title: string }) => {
    try {
      await createModule.mutateAsync({
        courseId: course.id,
        data: {
          title: data.title,
        },
      });

      setAddingModule(false);
    } catch (error) {
      console.error("Failed to create module:", error);
    }
  };

  return (
    <Page>
      <div style={{ maxWidth: 900, margin: "24px auto" }}>
        <Link
          href="/instructor"
          className="settings-back"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 24,
          }}
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>

        <div className="page-head" style={{ alignItems: "center" }}>
          <div>
            <div className="row" style={{ marginBottom: 12 }}>
              <Badge tone={course.status === "PUBLISHED" ? "default" : "muted"}>
                {displayStatus}
              </Badge>
            </div>
            <h1 style={{ fontSize: 32 }}>{course.title}</h1>
          </div>

          <div style={{ position: "relative" }}>
            <Button
              variant={isPublished ? "ghost" : "primary"}
              onClick={handlePublishToggle}
              disabled={publishCourse.isPending || unpublishCourse.isPending}
            >
              {publishCourse.isPending
                ? "Publishing..."
                : unpublishCourse.isPending
                  ? "Unpublishing..."
                  : isPublished
                    ? "Unpublish"
                    : "Publish Course"}
            </Button>
            {/* {course.status === 'DRAFT' && !isPublished && (
              <p style={{ position: 'absolute', top: '100%', right: 0, width: 220, textAlign: 'right', fontSize: 11, color: '#85827a', marginTop: 8 }}>
                Requires at least 1 module with 1 lesson and 1 quiz question.
              </p>
            )} */}
          </div>
        </div>

        <div className="stack" style={{ gap: 32, marginTop: 42 }}>
          <section>
            <div className="section-head" style={{ marginBottom: 16 }}>
              <h3>Modules</h3>
              <Button
                variant="secondary"
                onClick={() => setAddingModule(true)}
                testId="btn-add-module"
              >
                <Plus size={16} style={{ marginRight: 6 }} /> Add Module
              </Button>
            </div>

            {course.modules.length === 0 ? (
              <div
                className="card empty-state"
                style={{ minHeight: 160, padding: 32 }}
              >
                <p>No modules yet. Add one to get started.</p>
              </div>
            ) : (
              <ModuleList course={course} />
            )}
          </section>

          <section style={{ paddingBottom: 64 }}>
            <div className="section-head" style={{ marginBottom: 16 }}>
              <h3>Final Assessment</h3>
            </div>

            <FinalAssessmentEditor
              courseId={course.id}
              courseTitle={course.title}
            />
          </section>
        </div>

        {addingModule && (
          <ModuleFormModal
            module={{
              title: "",
              order: nextOrder,
            }}
            existingModules={course.modules}
            onClose={() => setAddingModule(false)}
            onSave={handleSaveNewModule}
            isSaving={createModule.isPending}
          />
        )}
      </div>
    </Page>
  );
}

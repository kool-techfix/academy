"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Page } from "@/components/page-shell";
import { Button } from "@/components/academy-ui";
import { FormField } from "@/components/form-field";
import { useCreateCourse } from "@/hooks/instructor/use-courses";
const schema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description is too long"),
});
type FormData = z.infer<typeof schema>;
export default function CourseNew() {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "" },
  });
  const onSubmit = async (data: FormData) => {
    try {
      const course = await createCourse.mutateAsync({
        title: data.title,
        description: data.description,
      });
      router.push(`/instructor/courses/${course.id}/edit`);
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };
  return (
    <Page>
      {" "}
      <div className="settings-layout" style={{ margin: "24px auto" }}>
        {" "}
        <Link
          href="/instructor"
          className="settings-back"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {" "}
          <ChevronLeft size={16} /> Back to Dashboard{" "}
        </Link>{" "}
        <div className="card settings-section">
          {" "}
          <div className="settings-section-heading">
            {" "}
            <h2>Create New Course</h2>{" "}
          </div>{" "}
          <form onSubmit={handleSubmit(onSubmit)} className="stack">
            {" "}
            <FormField
              label="Course Title"
              name="title"
              register={register}
              error={errors.title?.message}
              placeholder="e.g. Advanced Hardware Diagnostics"
            />{" "}
            <div className="form-field">
              {" "}
              <label htmlFor="description"> Description </label>{" "}
              <textarea
                id="description"
                placeholder="What will learners achieve in this course?"
                {...register("description")}
                aria-invalid={Boolean(errors.description)}
                disabled={createCourse.isPending}
                style={{
                  width: "100%",
                  minHeight: 120,
                  padding: "12px 13px",
                  border: "1px solid var(--brand-gray)",
                  borderRadius: 6,
                  background: "var(--brand-white)",
                  color: "var(--brand-black)",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  resize: "vertical",
                }}
              />{" "}
              {errors.description && (
                <div className="field-error">
                  {" "}
                  {errors.description.message}{" "}
                </div>
              )}{" "}
            </div>{" "}
            {createCourse.isError && (
              <div className="field-error">
                {" "}
                {createCourse.error instanceof Error
                  ? createCourse.error.message
                  : "Failed to create course. Please try again."}{" "}
              </div>
            )}{" "}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              {" "}
              <Button type="submit" disabled={createCourse.isPending}>
                {" "}
                {createCourse.isPending ? "Creating..." : "Create Draft"}{" "}
              </Button>{" "}
            </div>{" "}
          </form>{" "}
        </div>{" "}
      </div>{" "}
    </Page>
  );
}

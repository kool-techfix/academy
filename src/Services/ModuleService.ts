import { ModuleRepository } from "@/Repositories/ModuleRepository";
import { CourseRepository } from "@/Repositories/CourseRepository";

const moduleRepository = new ModuleRepository();
const courseRepository = new CourseRepository();

export class ModuleService {
  /** Modules with lessons and quiz answers — course authors only. */
  async getCourseModules(instructorId: string, courseId: string) {
    const course = await courseRepository.findById(courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    await ensureAuthor(instructorId, courseId);

    return moduleRepository.findByCourseId(courseId);
  }

  /** One module of `courseId` (incl. quiz answers) — course authors only. */
  async getModule(instructorId: string, courseId: string, id: string) {
    const courseModule = await moduleRepository.findById(id);

    // A module from another course is reported as missing, not forbidden.
    if (!courseModule || courseModule.courseId !== courseId) {
      throw new Error("Module not found");
    }

    await ensureAuthor(instructorId, courseId);

    return courseModule;
  }

  async createModule(
    instructorId: string,
    courseId: string,
    data: {
      title: string;
    },
  ) {
    const course = await courseRepository.findById(courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Verify instructor owns the course
    const author = await courseRepository.findAuthor(courseId, instructorId);

    if (!author) {
      throw new Error("You do not have permission to modify this course");
    }

    const maxOrder = await moduleRepository.findMaxOrder(courseId);

    return moduleRepository.create({
      courseId,
      title: data.title,
      order: maxOrder + 1,
    });
  }

  async updateModule(
    instructorId: string,
    moduleId: string,
    data: {
      title?: string;
      order?: number;
    },
  ) {
    const courseModule = await moduleRepository.findById(moduleId);

    if (!courseModule) {
      throw new Error("Module not found");
    }

    const author = await courseRepository.findAuthor(
      courseModule.courseId,
      instructorId,
    );

    if (!author) {
      throw new Error("You do not have permission to modify this module");
    }

    return moduleRepository.update(moduleId, data);
  }

  async deleteModule(instructorId: string, moduleId: string) {
    const courseModule = await moduleRepository.findById(moduleId);

    if (!courseModule) {
      throw new Error("Module not found");
    }

    const author = await courseRepository.findAuthor(
      courseModule.courseId,
      instructorId,
    );

    if (!author) {
      throw new Error("You do not have permission to delete this module");
    }

    return moduleRepository.delete(moduleId);
  }
}

async function ensureAuthor(instructorId: string, courseId: string) {
  if (!(await courseRepository.isAuthor(courseId, instructorId))) {
    throw new Error("You do not have permission to view this course");
  }
}

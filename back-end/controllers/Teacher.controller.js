import prisma, { PaymentStatus } from "../config/db.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { deleteFileIfExists } from "../utils/deleteFile.js";
// Teacher Dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  if (!teacherId) throw new Error("Teacher ID not found");

  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: { payments: true, enrollments: true },
  });

  const totalCourses = courses.length;

  const studentIds = new Set();
  courses.forEach((c) =>
    c.enrollments.forEach((e) => studentIds.add(e.userId)),
  );
  const totalStudents = studentIds.size;

  const totalEarnings = courses.reduce(
    (sum, c) => sum + c.payments.reduce((s, p) => s + p.amount, 0),
    0,
  );

  res.json({
    totalCourses,
    totalStudents,
    totalEarnings,
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      students: c.enrollments.length,
      earnings: c.payments.reduce((s, p) => s + p.amount, 0),
    })),
  });
});
export const getTeacherCourses = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;

  const courses = await prisma.course.findMany({
    where: { teacherId },
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      price: true,
      status: true,
      createdAt: true,
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, reviews: true } },
      reviews: { select: { rating: true } },
      lessons: {
        select: {
          id: true,
          title: true,
          content: true,
          sortOrder: true,
          videos: {
            select: { id: true, url: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const formatted = courses.map((course) => {
    const avgRating =
      course.reviews.length === 0
        ? null
        : (
          course.reviews.reduce((s, r) => s + r.rating, 0) /
          course.reviews.length
        ).toFixed(1);

    return {
      id: course.id,
      name: course.title,
      description: course.description,
      image: course.image,
      price: course.price,
      status: course.status,
      category: course.category
        ? { id: course.category.id, name: course.category.name }
        : null,
      students: course._count.enrollments,
      rating: avgRating,
      sales: course._count.enrollments,
      lessons: course.lessons.map((l) => ({
        ...l,
        videoUrl: l.videos[0]?.url
          ? `${process.env.VITE_BACKEND_URL}/${l.videos[0].url.replace(/^\/+/, "")}`
          : null,
      })),
    };
  });
  console.log("Backend formatted course:", formatted);
  res.json({
    success: true,
    data: formatted,
  });
});
// ตัวอย่างสำหรับ getIDCourses
export const getIDCourses = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) throw new AppError("ID not Number", 402);

  const course = await prisma.course.findUnique({
    where: { id: Number(id) },
    include: {
      lessons: { orderBy: { sortOrder: "asc" } },
      category: true,
      teacher: { select: { id: true, name: true } },
    },
  });

  if (!course) throw new AppError("Course not Found!", 401);

  // แปลง videoUrl ของแต่ละ lesson
  const lessonsWithVideos = course.lessons.map((l) => ({
    ...l,
    videos: Array.isArray(l.videoUrl)
      ? l.videoUrl.map((v, idx) => ({
        id: idx,
        url: `${process.env.VITE_BACKEND_URL}${v}`,
      }))
      : [],
  }));

  res.status(200).json({
    success: true,
    message: "Courses ID Okay!",
    course: {
      ...course,
      lessons: lessonsWithVideos,
    },
  });
});
export const createTeacherCourse = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const { title, description, price, status, categoryId } = req.body;

  if (!title || price === undefined)
    throw new AppError("Title and price are required", 400);

  const imageFile = req.files?.find((f) => f.fieldname === "image");
  const imageUrl = imageFile
    ? `/uploads/courses/images/${imageFile.filename}`
    : null;

  const lessons = req.body.lessons ? JSON.parse(req.body.lessons) : [];

  const createdCourse = await prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: {
        title,
        description,
        price: Number(price),
        status: "DRAFT",
        image: imageUrl,
        categoryId: categoryId ? Number(categoryId) : null,
        teacherId,
      },
    });


    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];

      const lessonCreated = await tx.lesson.create({
        data: {
          courseId: course.id,
          title: lesson.title,
          content: lesson.content ?? "",
          sortOrder: i + 1,
        },
      });

      // สร้าง LessonVideo
      const videoFiles = req.files.filter(
        (f) => f.fieldname === `video_lesson_${i}`,
      );
      for (const f of videoFiles) {
        await tx.lessonVideo.create({
          data: {
            lessonId: lessonCreated.id,
            url: `/uploads/lessons/videos/${f.filename}`,
          },
        });
      }
    }

    return tx.course.findUnique({
      where: { id: course.id },
      include: {
        lessons: { include: { videos: true }, orderBy: { sortOrder: "asc" } },
        category: true,
      },
    });
  });

  res.status(200).json({ success: true, data: createdCourse });
});
export const updateTeacherCourse = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const courseId = Number(req.params.id);
  if (isNaN(courseId)) throw new AppError("Invalid course ID", 400);

  const { title, description, price, status, categoryId } = req.body;
  const courseStatus = ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)
    ? status
    : "DRAFT";

  // หา course เดิมพร้อม lessons + videos
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { include: { videos: true } } },
  });
  if (!course || course.teacherId !== teacherId)
    throw new AppError("Course not found or unauthorized", 404);

  // ถ้ามี cover ใหม่
  const imageFile = req.files?.find((f) => f.fieldname === "image");
  const newImageUrl = imageFile
    ? `/uploads/courses/images/${imageFile.filename}`
    : course.image;

  const lessons = req.body.lessons ? JSON.parse(req.body.lessons) : [];
  const oldLessonMap = new Map(course.lessons.map((l) => [l.id, l]));

  const updatedCourse = await prisma.$transaction(async (tx) => {
    // update course info
    await tx.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        price: Number(price),
        status: courseStatus,
        image: newImageUrl,
        categoryId: categoryId ? Number(categoryId) : null,
      },
    });

    // --- DELETE lessons ที่ถูกลบใน front ---
    const remainingLessonIds = lessons
      .filter((l) => l.id)
      .map((l) => Number(l.id));
    const toDeleteLessons = course.lessons.filter(
      (l) => !remainingLessonIds.includes(l.id),
    );
    for (const l of toDeleteLessons) {
      await tx.lessonVideo.deleteMany({ where: { lessonId: l.id } }); // ลบ video ก่อน
      await tx.lesson.delete({ where: { id: l.id } });
    }

    // update หรือ create lessons ใหม่
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const oldLesson = lesson.id ? oldLessonMap.get(Number(lesson.id)) : null;

      let lessonUpdated;
      if (lesson.id) {
        lessonUpdated = await tx.lesson.update({
          where: { id: Number(lesson.id) },
          data: {
            title: lesson.title,
            content: lesson.content ?? "",
            sortOrder: i + 1,
          },
        });

        // ลบ video เก่า ถ้า frontend ส่ง flag replace
        const replaceFlag = req.body[`replace_video_lesson_${i}`];
        if (replaceFlag) {
          await tx.lessonVideo.deleteMany({
            where: { lessonId: lessonUpdated.id },
          });
        }
      } else {
        lessonUpdated = await tx.lesson.create({
          data: {
            courseId,
            title: lesson.title,
            content: lesson.content ?? "",
            sortOrder: i + 1,
          },
        });
      }

      // Add new videos
      const videoFiles = req.files.filter(
        (f) => f.fieldname === `video_lesson_${i}`,
      );
      for (const f of videoFiles) {
        await tx.lessonVideo.create({
          data: {
            lessonId: lessonUpdated.id,
            url: `/uploads/lessons/videos/${f.filename}`,
          },
        });
      }
    }

    return tx.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: { include: { videos: true }, orderBy: { sortOrder: "asc" } },
        category: true,
      },
    });
  });

  res.json({ success: true, data: updatedCourse });
});
export const getTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      include: {
        teacherProfile: true,
        coursesTaught: true,
      },
    });

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { name, subject, experience, phone } = req.body;
    const image = req.files?.image?.[0];
    console.log(req.files);
    // ถ้าอัปโหลดรูปใหม่
    let imageUrl;
    if (image) {
      imageUrl = `/uploads/courses/images/${image.filename}`;
    }

    // update teacher user
    await prisma.user.update({
      where: { id: teacherId },
      data: {
        name,
        ...(imageUrl && { image: imageUrl }), // อัปเดตรูปเฉพาะถ้ามี
      },
    });

    // update หรือสร้าง teacherProfile
    await prisma.teacherProfile.upsert({
      where: { userId: teacherId },
      update: { subject, experience: Number(experience), phone },
      create: {
        userId: teacherId,
        subject,
        experience: Number(experience),
        phone,
      },
    });

    // return ข้อมูลล่าสุด
    const updatedTeacher = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { teacherProfile: true, coursesTaught: true },
    });

    res.json({ message: "Profile updated", teacher: updatedTeacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const removeCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await prisma.course.findUnique({
    where: { id: Number(id) },
  });
  if (!course) {
    throw new AppError("Course not found.", 404);
  }

  const deletedCourse = await prisma.course.delete({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      price: true,
      type: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
      lessons: true,
    },
  });
  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
    course: deletedCourse,
  });
});
//  Teacher Categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json({
    success: true,
    data: categories,
  });
});
// Student Enrollment
export const getStudents = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;

  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: {
      lessons: { select: { id: true, title: true } },
      enrollments: {
        include: { user: true },
      },
    },
  });

  const students = [];

  for (const course of courses) {
    const totalLessons = course.lessons.length;
    const lessonIds = course.lessons.map((l) => l.id);

    for (const enroll of course.enrollments) {
      const progresses = await prisma.lessonProgress.findMany({
        where: {
          enrollmentId: enroll.id,
          lessonId: { in: lessonIds },
          watchedAt: { not: null },
        },
        include: {
          lesson: { select: { title: true } },
        },
        orderBy: { watchedAt: "desc" },
      });

      students.push({
        id: enroll.user.id,
        name: enroll.user.name,
        email: enroll.user.email,
        courseName: course.title,
        joinedDate: enroll.enrolledAt.toISOString().split("T")[0],

        watchedLessons: progresses.length,
        totalLessons,
        progressPercent:
          totalLessons === 0
            ? 0
            : Math.round((progresses.length / totalLessons) * 100),

        lastLessonTitle: progresses[0]?.lesson?.title || null,
      });
    }
  }

  res.json({ success: true, students });
});
export const myTeachingCourses = async (req, res) => {
  const teacherId = req.user.id;

  const courses = await prisma.course.findMany({
    where: {
      teacherId,
    },
    include: {
      category: true,
      _count: {
        select: {
          enrollments: true,
          lessons: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    courses: courses.map(c => ({
      id: c.id,
      title: c.title,
      image: c.image,
      price: c.price,
      status: c.status,
      students: c._count.enrollments,
      lessons: c._count.lessons,
    })),
  });
};
export const publishCourse = asyncHandler(async (req, res) => {
  const teacherId = req.user.id
  const courseId = Number(req.params.id)

  const course = await prisma.course.findUnique({
    where: { id: courseId }
  })

  if (!course || course.teacherId !== teacherId) {
    throw new AppError("Course not found or unauthorized", 404)
  }

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED" }
  })

  res.json({
    success: true,
    message: "Course published",
    course: updated
  })
})

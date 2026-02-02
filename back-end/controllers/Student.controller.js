import { asyncHandler } from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";
import prisma from "../config/db.js";

// =================== Categories ===================
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  res.json(categories);
});
// =================== Courses ===================
export const getCourses = asyncHandler(async (req, res) => {
  const userId = req.user?.id

  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: {
      category: true,
      teacher: true,
      enrollments: userId
        ? {
          where: { userId },
          select: { id: true }
        }
        : false
    },
    orderBy: { createdAt: "desc" },
  })

  const result = courses.map(c => ({
    ...c,
    isEnrolled: c.enrollments ? c.enrollments.length > 0 : false
  }))

  res.json(result)
})

export const getCourseDetail = async (req, res) => {
  const courseId = Number(req.params.id)
  const userId = req.user?.id

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { include: { videos: true } },
      enrollments: userId
        ? { where: { userId }, select: { status: true } }
        : false
    }
  })

  if (!course) return res.status(404).json({ message: "Not found" })

  const enrollment = course.enrollments?.[0]
  const approved = enrollment?.status === "APPROVED"

  res.json({
    ...course,
    lessons: approved ? course.lessons : [],
    enrollmentStatus: enrollment?.status || null
  })
}



export const studentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. คอร์สที่กำลังเรียน
    const enrolledCount = await prisma.enrollment.count({
      where: {
        userId,
        status: "ENROLLED",
      },
    });

    // 2. คอร์สที่เรียนจบ
    const completedCount = await prisma.enrollment.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    });

    // 3. Progress บทเรียน
    const progress = await prisma.progress.findMany({
      where: { userId },
      select: { isDone: true },
    });

    const totalLessons = progress.length;
    const completedLessons = progress.filter((p) => p.isDone).length;
    const lessonProgress = totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    // 4. ยอดเงินที่จ่ายแล้ว
    const totalPaid = await prisma.payment.aggregate({
      where: {
        userId,
        status: "COMPLETED",
      },
      _sum: { amount: true },
    });

    // 5. คอร์สล่าสุด
    const recentCourses = await prisma.studentCourse.findMany({
      where: { studentId: userId },
      take: 3,
      orderBy: { joinedAt: "desc" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            image: true,
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    const formattedCourses = recentCourses.map((c) => ({
      courseId: c.course.id,
      title: c.course.title,
      image: c.course.image,
      progress: c.progress,
      joinedAt: c.joinedAt,
    }));

    res.json({
      stats: {
        enrolled: enrolledCount,
        completed: completedCount,
        lessonProgress,
        totalPaid: totalPaid._sum.amount || 0,
      },
      recentCourses: formattedCourses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};
export const myCourses = async (req, res) => {
  const userId = req.user.id

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          image: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const result = enrollments.map(e => ({
    courseId: e.course.id,
    title: e.course.title,
    image: e.course.image,
    status: e.status,
    canAccess: e.status === "APPROVED"
  }))

  res.json(result)
}


export const courseLessons = async (req, res) => {
  try {
    const userId = req.user.id
    const courseId = Number(req.params.courseId)

    // 1. หา enrollment ก่อน
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!enrollment) {
      return res.status(403).json({ message: "Not enrolled" })
    }

    // 2. ดึง lesson + progress (ตาม enrollmentId)
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { sortOrder: "asc" },
      include: {
        videos: true,
        progresses: {
          where: {
            enrollmentId: enrollment.id,
          },
          select: {
            isCompleted: true,
          },
        },
      },
    })

    // 3. แปลง progress จาก array → boolean
    const result = lessons.map((l) => ({
      lessonId: l.id,
      title: l.title,
      content: l.content,
      videos: l.videos,
      isCompleted: l.progresses[0]?.isCompleted || false,
    }))

    res.json(result)
  } catch (err) {
    console.error("courseLessons error:", err)
    res.status(500).json({ message: "Load lessons failed" })
  }
}

export const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id
    const { lessonId } = req.body

    if (!lessonId) {
      return res.status(400).json({ message: "lessonId is required" })
    }

    // 1. หา enrollment จาก lesson → course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true },
    })

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" })
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
    })

    if (!enrollment) {
      return res.status(403).json({ message: "Not enrolled" })
    }

    // 2. upsert LessonProgress
    await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
    })

    res.json({ message: "Lesson completed" })
  } catch (err) {
    console.error("updateProgress error:", err)
    res.status(500).json({ message: "Update progress failed" })
  }
}

export const paymentHistory = async (req, res) => {
  const userId = req.user.id;

  const payments = await prisma.payment.findMany({
    where: { userId },
    include: {
      course: {
        select: { title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(payments);
};
export const createReview = async (req, res) => {
  const userId = req.user.id;
  const courseId = Number(req.params.id);
  const { rating, comment } = req.body;

  const enrolled = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId,
      status: { in: ["ENROLLED", "COMPLETED"] },
    },
  });

  if (!enrolled) {
    return res.status(403).json({
      message: "ต้องจองคอร์สก่อนจึงจะรีวิวได้",
    });
  }

  const alreadyReviewed = await prisma.review.findFirst({
    where: { userId, courseId },
  });

  if (alreadyReviewed) {
    return res.status(400).json({
      message: "คุณได้รีวิวคอร์สนี้ไปแล้ว",
    });
  }

  await prisma.review.create({
    data: {
      userId,
      courseId,
      rating,
      comment,
    },
  });

  res.json({ message: "Review submitted" });
};
export const studentGetCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    if (!studentId)
      return res.status(402).json({ message: "Student Not Found!" });
    const page = Number(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId: studentId,
          status: "PAID", // ✅ เพิ่มบรรทัดนี้
        },
        include: { course: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({
        where: {
          userId: studentId,
          status: "PAID", // ✅ เพิ่มด้วย
        },
      }),
    ]);

    res.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error studentGetCourse",
    });
  }
};
export const getPublishedTeacherCourses = async (req, res) => {
  try {
    const {
      page = 1,
      keyword = "",
      categoryId = "",
      type = "",
      minPrice = "",
      maxPrice = "",
      sortPrice = "",
    } = req.query;

    const PAGE_SIZE = 9;
    const skip = (Number(page) - 1) * PAGE_SIZE;

    /* ---------------- WHERE ---------------- */
    const where = {
      status: "PUBLISHED",
    };

    if (keyword) {
      where.title = {
        contains: keyword,
      };
    }

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    if (type) {
      where.type = type;
    }

    // 💰 price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    /* ---------------- ORDER BY ---------------- */
    let orderBy = { createdAt: "desc" };

    if (sortPrice === "asc") {
      orderBy = { price: "asc" };
    }

    if (sortPrice === "desc") {
      orderBy = { price: "desc" };
    }

    /* ---------------- QUERY ---------------- */
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: PAGE_SIZE,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
          category: true,
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      courses,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch courses failed" });
  }
};
export const studentGetCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        courses: true,
      },
      orderBy: {
        courses: {
          _count: "desc",
        },
      },
    });

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Fetch categories failed" });
  }
};
export const getCourseReviews = async (req, res) => {
  const { courseId } = req.params

  try {
    const reviews = await prisma.review.findMany({
      where: { courseId: Number(courseId) },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    res.json(reviews)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Load reviews failed" })
  }
}
export const getLessonProgress = async (req, res) => {
  const userId = req.user.id
  const courseId = Number(req.params.courseId)

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId }
    }
  })

  if (!enrollment || enrollment.status !== "APPROVED") {
    return res.status(403).json({
      message: "Course not approved yet"
    })
  }

  const progress = await prisma.lessonProgress.findMany({
    where: { userId, courseId },
    orderBy: { lessonId: "asc" }
  })

  res.json(progress)
}



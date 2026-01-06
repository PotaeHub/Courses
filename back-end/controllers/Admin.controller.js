import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../config/db.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt"
import { format } from "path";
// User Management
export const getAllUsers = asyncHandler(async (req, res) => {
    const user = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            name: true,
            createdAt: true,
            studentProfile: true,
            teacherProfile: true,
            adminProfile: true,
        },

    })
    if (!user) throw new AppError("User not Found!", 401)
    res.status(200).json({
        success: true,
        message: "Admin Dashborad",
        data: user
    })
})
export const getIDUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
        where: {
            id: Number(id)
        },
        select: {
            id: true,
            email: true,
            role: true,
            name: true,
            createdAt: true,
        }
    })
    if (!user) throw new AppError("User not Found!");
    res.status(200).json({ success: true, message: "Okay!", data: user })
})
export const createUser = asyncHandler(async (req, res) => {
    const {
        email,
        password,
        role,

        // common
        name,
        image,

        // student
        gradeLevel,
        classroom,
        phone,

        // teacher
        subject,
        experience,
    } = req.body;
    if (!email || !password) throw new AppError("required fild email or password!")
    const emailExists = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (emailExists) throw new AppError("User not Found!", 400);
    const hasPassowrd = await bcrypt.hash(password, 10)
    const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email,
                password: hasPassowrd,
                role: role,
                name,
                image,
            },
            include: {
                studentProfile: true,
                teacherProfile: true,
                adminProfile: true,
            },
        })
        if (!newUser) {
            throw new AppError("Failed to create user", 500);
        }
        if (role === "STUDENT") {
            await tx.studentProfile.create({ data: { userId: newUser.id, gradeLevel, classroom, phone } });
        }
        if (role === "TEACHER") {
            await tx.teacherProfile.create({ data: { userId: newUser.id, subject, experience, phone } });
        }
        if (role === "ADMIN") {
            await tx.adminProfile.create({ data: { userId: newUser.id, experience, phone } });
        }
        return newUser;
    })
    res.status(200).json({
        success: true,
        message: "Create Okay!",
        data: {
            id: result.id,
            email: result.email,
            data: { id: result.id, email: result.email, role: result.role },
        },
    })
})
export const editUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        email,
        role,

        // common
        name,
        image,

        // student
        gradeLevel,
        classroom,
        phone,

        // teacher
        subject,
        experience,
    } = req.body;
    const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.update({
            where: {
                id: Number(id)
            },
            data: {
                email,
                role: role,
                name,
                image,
            },
            include: {
                studentProfile: true,
                teacherProfile: true,
                adminProfile: true,
            },
        })
        if (!newUser) {
            throw new AppError("Failed to create user", 500);
        }
        if (role === "STUDENT") {
            await tx.studentProfile.upsert({ where: { userId: newUser.id }, update: { gradeLevel, classroom, phone }, create: { userId: newUser.id, gradeLevel, classroom, phone } });
        }
        if (role === "TEACHER") {
            await tx.teacherProfile.upsert({ where: { userId: newUser.id }, update: { subject, experience, phone }, create: { userId: newUser.id, subject, experience, phone } });
        }
        if (role === "ADMIN") {
            await tx.adminProfile.upsert({ where: { userId: newUser.id }, update: { experience, phone }, create: { userId: newUser.id, experience, phone } });
        }
        return newUser;

    })
    res.status(200).json({
        success: true,
        message: "Update successful!",
        data: {
            id: result.id,
            email: result.email,
            data: { id: result.id, email: result.email, role: result.role, image: result.image },
        },
    })
}
)
export const removeUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) throw new AppError("Invalid user ID", 400);

    const existingUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existingUser) throw new AppError("User not found", 404);

    const result = await prisma.$transaction(async (tx) => {
        await tx.studentProfile.deleteMany({ where: { userId: Number(id) } })
        await tx.adminProfile.deleteMany({ where: { userId: Number(id) } })
        await tx.teacherProfile.deleteMany({ where: { userId: Number(id) } })
        const user = await tx.user.delete({
            where: { id: Number(id) }
        })
        if (!user) throw new AppError("User not Found!");

        return user;
    })
    res.status(200).json({
        success: true,
        message: "Deleted successful!",
        data: {
            id: result.id,
        },
    })
})
// Category Management
export const getAllCategories = asyncHandler(async (req, res) => {
    const category = await prisma.category.findMany();
    if (!category) throw new AppError("Category not Found!", 401)
    res.status(200).json({
        success: true,
        message: "okay!",
        category: category
    })
})
export const getIDCategories = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) throw new AppError("ID use Number", 401)
    const category = await prisma.category.findFirst({
        where: { id: Number(id) }
    });
    if (!category) throw new AppError("Category not Found!", 401)
    res.status(200).json({
        success: true,
        message: "okay!",
        category: category
    })
})
export const createCategories = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) throw new AppError("request Name Found! ", 401)
    const existingCategory = await prisma.category.findUnique({
        where: {
            name: name,
        }
    })
    if (existingCategory) throw new AppError("Category exsisting!", 401)
    const category = await prisma.category.create({
        data: {
            name: name
        },
        select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    })
    if (!category) throw new AppError("Category not Found!", 401)
    res.status(200).json({
        success: true,
        message: "Create Category Okay",
        category: category,
    })
})
export const EditCategories = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { name } = req.body
    if (isNaN(id)) throw new AppError("ID use Number", 401)
    if (!name) {
        throw new AppError("Name is required", 400)
    }

    const existingCategory = await prisma.category.findUnique({
        where: { id: Number(id) },
    })

    if (!existingCategory) {
        throw new AppError("Category not found", 404)
    }

    const category = await prisma.category.update({
        where: { id: Number(id) },
        data: { name },
        select: {
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    })
    if (!category) throw new AppError("Category not Found!", 401)
    res.status(200).json({
        success: true,
        message: "Update category success",
        category,
    })
})
export const RemoveCategories = asyncHandler(async (req, res) => {
    const { id } = req.params
    if (isNaN(id)) throw new AppError("ID use Number", 401)
    const existingCategory = await prisma.category.findUnique({
        where: { id: Number(id) },
    })

    if (!existingCategory) {
        throw new AppError("Category not found", 404)
    }

    const category = await prisma.category.delete({
        where: {
            id: Number(id),
        },
        select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    })
    if (!category) throw new AppError("Category not Found!", 401)
    res.status(200).json({
        success: true,
        message: "Delete category success",
        category,
    })
})
// CRUD Course along with Lessons
export const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await prisma.course.findMany({
        include: {
            lessons: {
                orderBy: { sortOrder: 'asc' }
            },
            teacher: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            category: true
        }
    })

    res.status(200).json({
        success: true,
        message: "Courses Okay!",
        courses
    })
})
export const getIDCourses = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) throw new AppError("ID not Number", 402);
    const course = await prisma.course.findUnique({
        where: { id: Number(id) },
        include: {
            lessons: { orderBy: { sortOrder: 'asc' } },
            category: true,
            teacher: {
                select: { id: true, name: true }
            }
        }
    })

    if (!course) throw new AppError("Course not Found!", 401);
    res.status(200).json({
        success: true,
        message: "Courses ID Okay!",
        course: course
    })
})
export const createCourseWithLessons = asyncHandler(async (req, res) => {
    const { title, description, price, type, categoryId, lessons } = req.body;

    // ไฟล์
    const image = req.files?.image?.[0];
    const lessonVideos = req.files?.lessonVideos || [];
    console.log("Image filename:", image?.filename);
    lessonVideos.forEach((v, i) => console.log(`Video ${i}:`, v.filename, v.originalname));

    // Validation
    if (!title || price === undefined) throw new AppError("Title and price are required.", 400);
    if (isNaN(price)) throw new AppError("Price must be a number.", 400);

    // Category
    let category = null;
    if (categoryId) {
        category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
        if (!category) throw new AppError("Category not found.", 400);
    }

    // Image URL
    const imageUrl = image ? `/uploads/images/${image.filename}` : null;

    // Parse lessons
    let lessonArray = [];
    if (lessons) {
        try {
            lessonArray = JSON.parse(lessons);
            if (!Array.isArray(lessonArray)) throw new AppError("Lessons must be an array", 400);
        } catch (error) {
            throw new AppError("Invalid lessons format", 400);
        }
    }

    // Map video file ของแต่ละ lesson
    lessonArray = lessonArray.map((lesson, i) => {
        const videoFile = lessonVideos.find(f => f.originalname === lesson.videoFileName);
        return {
            ...lesson,
            videoUrl: videoFile ? `/uploads/videos/${videoFile.filename}` : null
        };
    });

    // Debug final
    // console.log("=== req.body ===", req.body);
    // console.log("=== req.files ===", req.files);
    // console.log("Image file:", image);
    // console.log("Lesson videos:", lessonVideos);
    // console.log("Parsed lessons:", lessonArray);

    // Create course
    const course = await prisma.course.create({
        data: {
            title,
            description,
            image: imageUrl,
            price: Number(price),
            type,
            categoryId: category ? category.id : null,
            teacherId: req.user?.id || null,
            lessons: lessonArray.length
                ? {
                    create: lessonArray.map((lesson, i) => ({
                        title: lesson.title,
                        content: lesson.content,
                        sortOrder: lesson.sortOrder ?? i + 1,
                        videoUrl: lesson.videoUrl || null
                    }))
                }
                : undefined
        },
        include: { lessons: { orderBy: { sortOrder: "asc" } } }
    });

    res.status(200).json({
        message: "Course created successfully",
        course
    });
});
export const updateCourseWithLessons = asyncHandler(async (req, res) => {
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) throw new AppError("ID must be a number", 400);

    const {
        title,
        description,
        price,
        type,
        categoryId,
        lessons,
        deletedLessonIds
    } = req.body;

    const image = req.files?.image?.[0];
    const lessonVideos = req.files?.lessonVideos || [];

    if (!title || price === undefined) throw new AppError("Title and price are required.", 400);
    if (isNaN(price)) throw new AppError("Price must be a number.", 400);

    // category
    let category = null;
    if (categoryId) {
        category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
        if (!category) throw new AppError("Category not found.", 400);
    }

    // parse lessons
    let lessonArray = []
    try {
        lessonArray = lessons
            ? typeof lessons === 'string'
                ? JSON.parse(lessons)
                : lessons
            : []
    } catch {
        throw new AppError("Invalid lessons format", 400)
    }
    if (!Array.isArray(lessonArray)) {
        throw new AppError("Lessons must be an array", 400);
    }

    const parsedDeletedLessonIds = deletedLessonIds
        ? Array.isArray(deletedLessonIds)
            ? deletedLessonIds
            : JSON.parse(deletedLessonIds)
        : [];

    const updatedCourse = await prisma.$transaction(async (tx) => {
        const course = await tx.course.findUnique({ where: { id: courseId } });
        if (!course) throw new AppError("Course not found", 404);

        // image
        const imageUrl = image
            ? `/uploads/images/${image.filename}`
            : course.image;

        // update course only
        await tx.course.update({
            where: { id: courseId },
            data: {
                title,
                description,
                price: Number(price),
                type,
                categoryId: category ? category.id : null,
                image: imageUrl
            }
        });

        // delete lessons
        if (parsedDeletedLessonIds.length) {
            await tx.lesson.deleteMany({
                where: {
                    id: { in: parsedDeletedLessonIds.map(Number) },
                    courseId
                }
            });
        }

        // update / create lessons
        for (let i = 0; i < lessonArray.length; i++) {
            const lesson = lessonArray[i];
            const lessonVideo = lessonVideos.find(
                f => f.originalname === lesson.videoFileName
            );

            const videoUrl = lessonVideo
                ? `/uploads/videos/${lessonVideo.filename}`
                : lesson.videoUrl || null;

            if (lesson.id) {
                await tx.lesson.update({
                    where: { id: lesson.id },
                    data: {
                        title: lesson.title,
                        content: lesson.content,
                        sortOrder: i + 1,
                        videoUrl
                    }
                });
            } else {
                await tx.lesson.create({
                    data: {
                        courseId,
                        title: lesson.title,
                        content: lesson.content,
                        sortOrder: i + 1,
                        videoUrl
                    }
                });
            }
        }

        return tx.course.findUnique({
            where: { id: courseId },
            include: {
                lessons: { orderBy: { sortOrder: 'asc' } }
            }
        });
    });
    // console.log("Updated Course:", updatedCourse);
    res.json({
        message: "Course updated successfully",
        course: updatedCourse
    });
});
export const RemoveCourses = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        throw new AppError("Invalid course id.", 400);
    }

    // 🔍 เช็กว่ามี course จริงไหม
    const course = await prisma.course.findUnique({
        where: { id: Number(id) }
    });

    if (!course) {
        throw new AppError("Course not found.", 404);
    }

    // 🔐 Admin ลบได้ทุกคอร์ส | Teacher ลบได้เฉพาะของตัวเอง
    if (
        req.user.role !== "ADMIN" &&
        course.teacherId !== req.user.id
    ) {
        throw new AppError("You are not allowed to delete this course.", 403);
    }

    const deletedCourse = await prisma.course.delete({
        where: { id: Number(id) },
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
            lessons: true
        }
    });

    res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        course: deletedCourse
    });
});

// Dashboard Stats (Optional)
export const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        userCount,
        courseCount,
        categoryCount,
        enrollmentCount,
        revenue
    ] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.category.count(),
        prisma.enrollment.count(),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'COMPLETED' }
        })
    ]);

    res.status(200).json({
        success: true,
        data: {
            userCount,
            courseCount,
            categoryCount,
            enrollmentCount,
            totalRevenue: revenue?._sum?.amount || 0
        }
    });
});

// controllers/admin/dashboard.controller.js
export const getRevenueChart = async (req, res) => {
    const payments = await prisma.payment.findMany({
        where: {
            status: 'COMPLETED'
        },
        select: {
            amount: true,
            paymentDate: true
        }
    })

    const monthly = {}

    payments.forEach(p => {
        const month = p.paymentDate.toISOString().slice(0, 7) // YYYY-MM
        monthly[month] = (monthly[month] || 0) + p.amount
    })

    const data = Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, total]) => ({
            month,
            total
        }))

    res.status(200).json({
        success: true,
        data
    })
}





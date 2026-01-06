import prisma from "../config/db.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError("Email and password are required", 400);
    }
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new AppError("Invalid email or password", 401)

    const payload = {
        id: user.id,
        role: user.role,
        email: user.email
    }
    const accessToken = jwt.sign(payload, process.env.ACCSSES_TOKEN, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "7d" });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
    })
    res.status(200).json({
        success: true,
        message: "Login successfully!",
        data: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        accessToken: accessToken,

    });
});
export const register = asyncHandler(async (req, res) => {
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


    if (!email || !password || !role) {
        throw new AppError("Email and password are required", 400);
    }

    const emailExists = await prisma.user.findUnique({
        where: { email }
    });

    if (emailExists) {
        throw new AppError("Email already exists", 400);
    }
    const hasPassowrd = await bcrypt.hash(password, 10)
    const user = await prisma.$transaction(async (tx) => {
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
        });
        if (!newUser) {
            throw new AppError("Failed to create user", 500);
        }
        if (role === "STUDENT") {
            await tx.studentProfile.create({
                data: {
                    userId: newUser.id,
                    gradeLevel,
                    classroom,
                    phone
                },
            });
        }
        if (role === "TEACHER") {
            await tx.teacherProfile.create({
                data: {

                    userId: newUser.id,
                    subject,
                    experience,
                    phone,
                }
            })
        }
        if (role === "ADMIN") {
            await tx.adminProfile.create({
                data: {
                    userId: newUser.id,
                    experience,
                    phone,
                }
            })
        }
        return newUser;

    })

    res.status(200).json({
        success: true,
        message: "Register successfully!",
        data: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
});
export const getUser = asyncHandler(async (req, res) => {

    const user = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            name: true,
            image: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Okay!",
        data: user,
    });
});
export const getUserId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
        where: {
            id: Number(id),
        },
        select: {
            id: true,
            email: true,
            role: true,
            name: true,
            image: true,
            createdAt: true
        }
    })
    if (!user) {
        throw new AppError("User not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Okay!",
        data: user
    })
})

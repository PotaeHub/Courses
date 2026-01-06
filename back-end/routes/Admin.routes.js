import { Router } from "express";
import { createUser, editUser, getAllCategories, getAllUsers, getIDCategories, getIDUser, removeUser, createCategories, EditCategories, RemoveCategories, getAllCourses, getIDCourses, RemoveCourses, createCourseWithLessons, updateCourseWithLessons, getRevenueChart, getDashboardStats } from "../controllers/Admin.controller.js";
import { Roles } from "../middlewares/checkRole.js";
import { auth } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
const router = Router();

router.get("/admin/users", auth, Roles("ADMIN"), getAllUsers)
router.get("/admin/user/:id", auth, Roles("ADMIN"), getIDUser)
router.post("/admin/create-user", auth, Roles("ADMIN"), createUser);
router.put("/admin/edit-user/:id", auth, Roles("ADMIN"), editUser)
router.delete("/admin/remove-user/:id", auth, Roles("ADMIN"), removeUser)

router.get("/admin/category", auth, Roles("ADMIN"), getAllCategories);
router.get("/admin/category/:id", auth, Roles("ADMIN"), getIDCategories)
router.post("/admin/category", auth, Roles("ADMIN"), createCategories)
router.put("/admin/category/:id", auth, Roles("ADMIN"), EditCategories)
router.delete("/admin/category/:id", auth, Roles("ADMIN"), RemoveCategories)

router.get("/admin/courses", auth, Roles("ADMIN"), getAllCourses)
router.get("/admin/courses/:id", auth, Roles("ADMIN"), getIDCourses)
router.post("/admin/courses", auth, Roles("ADMIN"), upload.fields([
    { name: "image", maxCount: 1 },
    { name: "lessonVideos", maxCount: 20 },
]), createCourseWithLessons);
router.put("/admin/courses/:id", auth, Roles("ADMIN"), upload.fields([
    { name: "image", maxCount: 1 },
    { name: "lessonVideos", maxCount: 20 },
]), updateCourseWithLessons);
router.delete("/admin/courses/:id", auth, Roles("ADMIN"), RemoveCourses);

// Dashboard 
router.get("/admin/revenue-chart", auth, Roles("ADMIN"), getRevenueChart);
router.get("/admin/dashboard", auth, Roles("ADMIN"), getDashboardStats);
export default router;
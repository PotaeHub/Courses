import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import Dashboard from '../pages/admin/Dashboard.vue';
import Courses from '../pages/admin/Courses.vue';
import Users from '../pages/admin/Users.vue';
import Login from '../pages/auth/Login.vue';
import Register from '../pages/auth/Register.vue';
import Category from '../pages/admin/Category.vue';
import TeacherLayout from '../layouts/TeacherLayout.vue';
import TeacherDashboard from '../pages/teacher/TeacherDashboard.vue';
import TeacherMycourse from '../pages/teacher/TeacherMycourse.vue';
import TeacherStudentsView from '../pages/teacher/TeacherStudentsView.vue';
import TeacherProfile from '../pages/teacher/TeacherProfile.vue';
import StudentDashboard from '../pages/Student/Dashboard.vue';
import MainLayout from '../layouts/MainLayout.vue';
import StudentLayout from '../layouts/StudentLayout.vue';
import CourseDetail from '../pages/Student/CourseDetail.vue';
import { useAuthStore } from '../../Store/auth';
import Payment from '../pages/Payment.vue';
import Adminpayments from '../pages/admin/Adminpayments.vue';
import MyCourses from '../pages/Student/MyCourses.vue';
import StudentCourses from '../pages/Student/StudentCourses.vue';

const routes = [
    {
        path: '/', component: MainLayout,
        children: [
            {
                path: '',
                name: 'home',
                component: Home
            }
        ]

    },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    {
        path: '/admin',
        component: AdminLayout,
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'courses', component: Courses },
            { path: 'users', component: Users },
            { path: 'category', component: Category },
            { path: 'payments', component: Adminpayments }
        ]
    },
    {
        path: '/teacher',
        component: TeacherLayout,
        meta: { requiresAuth: true, role: 'TEACHER' },
        children: [
            { path: 'dashboard', component: TeacherDashboard },
            { path: 'courses', component: TeacherMycourse },
            { path: 'students', component: TeacherStudentsView },
            { path: 'profile', component: TeacherProfile },
        ]
    },
    {
        path: '/student',
        component: StudentLayout,
        meta: { requiresAuth: true, role: 'STUDENT' },
        children: [
            { path: 'dashboard', component: StudentDashboard },
            {
                path: 'course/:id',
                name: 'student-course-detail',
                component: CourseDetail
            },
            {
                path: "payment/:id",
                name: "student-payment",
                component: Payment
            },
            {
                path: "mycourses",
                name: "student-my-courses",
                component: MyCourses
            },
            {
                path: "courses",
                name: "student-courses",
                component: StudentCourses
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});
router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    const requiresAuth = to.matched.some(
        record => record.meta.requiresAuth
    )

    const requiredRole = to.matched.find(
        record => record.meta.role
    )?.meta.role


    if (requiredRole && auth.user?.role !== requiredRole) {
        return next('/')
    }



    next()
})


export default router;
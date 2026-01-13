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
        ]
    },
    {
        path: '/teacher',
        component: TeacherLayout,
        children: [
            { path: 'dashboard', component: TeacherDashboard },
            { path: 'courses', component: TeacherMycourse },
            { path: 'students', component: TeacherStudentsView },
            // { path: 'earnings', component: TeacherEarnings },
            { path: 'profile', component: TeacherProfile },
        ]
    },
    {
        path: '/student',
        component: StudentLayout,
        children: [
            { path: 'dashboard', component: StudentDashboard },
            {
                path: 'course/:id',
                name: 'student-course-detail',
                component: CourseDetail
            }
            // { path: 'courses', component: () => import('../pages/Student/MyCourses.vue') },
            // { path: 'courses/:courseId', component: () => import('../pages/Student/CourseLearning.vue') },
            // { path: 'courses/:courseId/lessons/:lessonId', component: () => import('../pages/Student/LessonView.vue') },
            // { path: 'payments', component: () => import('../pages/Student/Payments.vue') },
            // { path: 'profile', component: () => import('../pages/Student/Profile.vue') },
            // { path: 'reviews', component: () => import('../pages/Student/Reviews.vue') },
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

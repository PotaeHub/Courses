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

const routes = [
    { path: '/', component: Home },
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
            // { path: 'profile', component: TeacherProfile },
        ]
    }

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

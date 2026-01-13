<template>
    <footer class="bg-gray-900 text-gray-400 py-12 mt-12">
        <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">

            <!-- Logo & Description -->
            <div class="space-y-3">
                <h1 class="text-xl font-bold text-white tracking-tight uppercase">
                    CourseHub
                </h1>
                <p class="text-gray-400 text-sm">
                    เรียนรู้ได้ทุกที่ทุกเวลา กับคอร์สออนไลน์คุณภาพสูง
                </p>
            </div>

            <!-- Links 1 -->
            <div>
                <h2 class="text-sm font-bold uppercase mb-3">Explore</h2>
                <ul class="space-y-2 text-gray-400 text-sm">
                    <li><router-link to="/" class="hover:text-white">Home</router-link></li>
                    <li><router-link to="/courses" class="hover:text-white">Courses</router-link></li>
                    <li><router-link to="/categories" class="hover:text-white">Categories</router-link></li>
                    <li><router-link to="/about" class="hover:text-white">About Us</router-link></li>
                </ul>
            </div>

            <!-- Links 2 -->
            <div>
                <h2 class="text-sm font-bold uppercase mb-3">Support</h2>
                <ul class="space-y-2 text-gray-400 text-sm">
                    <li><router-link to="/faq" class="hover:text-white">FAQ</router-link></li>
                    <li><router-link to="/contact" class="hover:text-white">Contact</router-link></li>
                    <li><router-link to="/terms" class="hover:text-white">Terms of Service</router-link></li>
                    <li><router-link to="/privacy" class="hover:text-white">Privacy Policy</router-link></li>
                </ul>
            </div>

            <!-- Newsletter -->
            <div class="space-y-3">
                <h2 class="text-sm font-bold uppercase mb-3">Newsletter</h2>
                <p class="text-gray-400 text-sm">สมัครรับข่าวสารคอร์สใหม่ ๆ</p>
                <div class="flex gap-2">
                    <input type="email" placeholder="Email Address"
                        class="flex-1 px-3 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600" />
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                        Subscribe
                    </button>
                </div>
            </div>

        </div>

        <div class="mt-10 text-center text-gray-500 text-sm">
            © 2026 CourseHub. All rights reserved.
        </div>
    </footer>
</template>

<script setup>

</script>

<style scoped>
@import 'tailwindcss';

footer {
    font-family: 'Inter', sans-serif;
}
</style>

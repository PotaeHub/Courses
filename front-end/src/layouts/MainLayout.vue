<template>
    <div class="flex">

        <div class="flex-1 flex flex-col min-h-screen">
            <navbar />
            <main class="p-6 bg-gray-100 flex-1">
                <hero-section />
                <feature-stats />
                <course-categories />
                <slot />
            </main>
            <footer class="py-10 text-center text-gray-500 border-t">
                <p>© 2025 CourseHub. All rights reserved.</p>
            </footer>
        </div>
    </div>
</template>

<script setup>
import CourseCategories from '../components/Home/CourseCategories.vue';
import FeatureStats from '../components/Home/FeatureStats.vue';
import HeroSection from '../components/Home/HeroSection.vue';
import Navbar from '../components/Navbar.vue';
</script>

<template>
    <div>
        <Navbar />

        <main class="min-h-screen bg-gray-50">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

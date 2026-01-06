<template>
    <div class="flex min-h-screen">
        <Sidebar />
        <div class="flex-1 flex flex-col">
            <Topbar />
            <main class="p-6 bg-gray-100 flex-1">
                <RouterView />
            </main>
        </div>
    </div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue';
import Topbar from '../components/Topbar.vue';
import { RouterView } from 'vue-router';
</script>

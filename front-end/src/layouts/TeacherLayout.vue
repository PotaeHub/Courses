<script setup>
import TeacherSidebar from '../components/Teacher/TeacherSidebar.vue'
import TeacherTopbar from '../components/Teacher/TeacherTopbar.vue'
</script>

<template>
    <div class="flex min-h-screen bg-slate-100">
        <TeacherSidebar />

        <div class="flex-1 flex flex-col">
            <TeacherTopbar />
            <main class="p-8">
                <router-view />
            </main>
        </div>
    </div>
</template>

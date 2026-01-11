<script setup>
import { ref, onMounted } from 'vue'
import { Bell } from 'lucide-vue-next'
import TeacherProfileModal from './TeacherProfileModal.vue'
import api from '../../service/api'

const user = ref({ name: '', image: null })
const showProfileModal = ref(false)

const openProfile = () => showProfileModal.value = true
const closeProfile = () => showProfileModal.value = false

const fetchUser = async () => {
    try {
        const res = await api.get('http://localhost:5000/teacher/profile')
        user.value.name = res.data.name
        user.value.image = res.data.image
    } catch (err) {
        console.error(err)
    }
}

// refresh after update
const refreshProfile = () => fetchUser()

onMounted(fetchUser)
</script>

<template>
    <header class="h-[72px] bg-white border-b px-8 flex items-center justify-between shadow-sm">
        <h1 class="text-xl font-bold text-slate-800">{{ user.name }}'s Courses</h1>
        <div class="flex items-center gap-6">
            <Bell class="w-6 h-6 text-slate-500" />
            <div class="flex items-center gap-3 cursor-pointer" @click="openProfile">
                <div
                    class="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm hover:border-blue-400 transition-all">
                    <img v-if="user.image" :src="user.image" class="w-10 h-10 object-cover" />
                    <div v-else class="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-400">
                        <span>{{ user.name.charAt(0) }}</span>
                    </div>
                </div>
                <div class="flex flex-col">
                    <p class="font-semibold text-sm">{{ user.name }}</p>
                    <p class="text-xs text-emerald-500 uppercase tracking-tighter">Online</p>
                </div>
            </div>
        </div>
    </header>

    <TeacherProfileModal :show="showProfileModal" @close="closeProfile" @updated="refreshProfile" />
</template>

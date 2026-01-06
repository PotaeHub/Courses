<script setup>
import BaseModal from './BaseModal.vue'
import { computed } from 'vue'

const props = defineProps({
    show: Boolean,
    user: Object
})

const emit = defineEmits(['close'])

const phone = computed(() => {
    if (!props.user) return '-'
    return props.user.studentProfile?.phone || props.user.teacherProfile?.phone || props.user.adminProfile?.phone || '-'
})

// ฟังก์ชันจัดรูปแบบวันที่ให้สวยงาม
const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
</script>

<template>
    <BaseModal :show="show" @close="emit('close')">
        <div v-if="user" class="overflow-hidden">
            <div class="relative pt-10 pb-6 flex flex-col items-center bg-gradient-to-b from-blue-50/50 to-transparent">
                <div class="relative group">
                    <div
                        class="absolute inset-0 bg-blue-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500">
                    </div>

                    <img v-if="user.image" :src="user.image"
                        class="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl" />

                    <div v-else
                        class="relative w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-white">
                        {{ user.name?.charAt(0).toUpperCase() }}
                    </div>

                    <div
                        class="absolute bottom-1 right-1 px-3 py-1 bg-white shadow-lg rounded-full border border-gray-100 flex items-center gap-1.5">
                        <div class="w-2 h-2 rounded-full"
                            :class="user.role === 'ADMIN' ? 'bg-red-500' : user.role === 'TEACHER' ? 'bg-green-500' : 'bg-blue-500'">
                        </div>
                        <span class="text-[10px] font-black uppercase tracking-tighter text-gray-600">{{ user.role
                            }}</span>
                    </div>
                </div>

                <h3 class="mt-6 text-2xl font-black text-gray-800 tracking-tight">{{ user.name }}</h3>
                <p class="text-sm font-medium text-gray-400">@{{ user.email.split('@')[0] }}</p>
            </div>

            <div class="px-6 pb-8 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4">
                        <div
                            class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                            <p class="text-sm font-bold text-gray-700 truncate w-50">{{ user.email }}</p>
                        </div>
                    </div>

                    <div class="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4">
                        <div
                            class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Since</p>
                            <p class="text-sm font-bold text-gray-700">{{ formatDate(user.createdAt) }}</p>
                        </div>
                    </div>
                </div>

                <div class="relative">
                    <div class="absolute inset-0 flex items-center"><span
                            class="w-full border-t border-dashed border-gray-200"></span></div>
                    <div class="relative flex justify-center"><span
                            class="bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Additional
                            Information</span></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-white rounded-2xl border-2 border-blue-50 shadow-sm flex items-center gap-4">
                        <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-blue-400 uppercase">Phone Number</p>
                            <p class="text-sm font-black text-blue-900">{{ phone }}</p>
                        </div>
                    </div>

                    <div v-if="user.role === 'TEACHER'"
                        class="p-4 bg-green-50/30 rounded-2xl border-2 border-green-50 shadow-sm flex items-center gap-4 transition-all">
                        <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-green-400 uppercase">Specialist Subject</p>
                            <p class="text-sm font-black text-green-900">{{ user.teacherProfile?.subject || '-' }}</p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-4">
                    <button @click="emit('close')"
                        class="flex-1 py-3 rounded-2xl cursor-pointer bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200 transition-all active:scale-95">
                        ปิดหน้าต่าง
                    </button>
                    <!-- <button
                        class="flex-[1.5] py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span>Send Message</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button> -->
                </div>
            </div>
        </div>
    </BaseModal>
</template>
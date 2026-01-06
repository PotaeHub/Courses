<script setup>
import UserBadge from './UserBadge.vue'

defineProps({
    users: Array,
    loading: Boolean
})

const emit = defineEmits(['edit', 'delete', 'view'])
</script>

<template>
    <div class="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
        <table class="w-full text-left">
            <thead>
                <tr class="bg-gray-50/50 border-b border-gray-100">
                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase">ผู้ใข้งาน</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase">สิทธิ์</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase">วันที่</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase">ดูโปรไฟล์ </th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">สถานะ</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
                <tr v-if="loading" class="animate-pulse">
                    <td colspan="4" class="px-6 py-10 text-center text-gray-400">Loading users...</td>
                </tr>

                <tr v-for="user in users" :key="user.id" class="hover:bg-blue-50/30 transition-colors group">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <img v-if="user.image" :src="user.image"
                                class="w-10 h-10 rounded-full object-cover border" />
                            <div v-else
                                class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase">
                                {{ user.name?.charAt(0) || '-' }}
                            </div>
                            <div>
                                <p class="text-sm font-bold text-gray-800">{{ user.name || 'Unknown' }}</p>
                                <p class="text-xs text-gray-500">{{ user.email }}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <UserBadge :role="user.role" />
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        {{ new Date(user.createdAt).toLocaleDateString() }}
                    </td>
                    <td class="px-6 py-4 text-sm text-blue-500">
                        <button @click="emit('view', user)" class="border-b-2 cursor-pointer hover:text-blue-600">ดูโปรไฟล์</button>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex justify-end gap-2  group-hover:opacity-100 transition-opacity">
                            <button @click="emit('edit', user)"
                                class="p-2 text-blue-600 bg-blue-200 cursor-pointer rounded-lg">
                                Edit
                            </button>
                            <button @click="emit('delete', user.id)"
                                class="p-2 text-red-600 bg-red-200  cursor-pointer rounded-lg">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
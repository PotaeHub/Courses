<script setup>
defineProps({
    categories: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['edit', 'delete'])

import { Folder, Pencil, Trash2 } from 'lucide-vue-next'
</script>

<template>
    <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full table-fixed text-sm">
                <!-- HEADER -->
                <thead>
                    <tr class="border-b border-gray-100 bg-white">
                        <th
                            class="px-8 py-5 text-center text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                            ID
                        </th>
                        <th class="px-8 py-5 text-left text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                            Category Name
                        </th>
                        <th
                            class="px-8 py-5 text-center text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                            Created At
                        </th>
                        <th
                            class="px-8 py-5 text-right text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                            Actions
                        </th>
                    </tr>
                </thead>


                <tbody class="divide-y divide-gray-100">
                    <tr v-for="(cat, index) in categories" :key="cat.id"
                        class="group hover:bg-gray-50/60 transition-colors">

                        <td class="px-8 py-5 text-center font-bold text-gray-800">
                            {{ index + 1 }}
                        </td>


                        <td class="px-8 py-5">
                            <div class="flex items-center gap-4">
                                <div :class="cat.color || 'bg-indigo-500'"
                                    class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shadow-black/10">
                                    <Folder class="w-6 h-6 text-white transition group-hover:scale-110" />
                                </div>
                                <span class="font-bold text-gray-800">
                                    {{ cat.name }}
                                </span>
                            </div>
                        </td>


                        <td class="px-8 py-5 text-center font-medium text-gray-700">
                            {{ new Date(cat.createdAt).toLocaleString('th-TH', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            }) }}
                        </td>


                        <td class="px-8 py-5 text-right">
                            <div class="inline-flex gap-2">
                                <button @click="emit('edit', cat)"
                                    class="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                                    <Pencil class="w-5 h-5 transition hover:scale-110" />
                                </button>

                                <button @click="emit('delete', cat.id)"
                                    class="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition">
                                    <Trash2 class="w-5 h-5 transition hover:rotate-12" />
                                </button>
                            </div>
                        </td>
                    </tr>


                    <tr v-if="!categories.length">
                        <td colspan="4" class="px-8 py-10 text-center text-gray-400">
                            ไม่มีข้อมูลหมวดหมู่
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

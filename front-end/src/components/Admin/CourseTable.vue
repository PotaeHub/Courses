<script setup>
import { BookOpen, Eye, Pencil, Trash2 } from 'lucide-vue-next'

defineProps({
    course: {
        type: Array,
        default: () => []
    }
})

defineEmits(['view', 'edit'])


const getCourseImage = (image) => {
    if (!image || image === 'no image') return null;
    const cleanedImage = image.replace(/^\/+/, '');
    return `${import.meta.env.VITE_BACKEND_URL}/${cleanedImage}`;
}


const getUserProfileImage = (user) => {
    if (!user) return null;
    if (user.image) return `${import.meta.env.VITE_BACKEND_URL}/${user.image}`;
    return null;
}

const getUserInitial = (user) => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return null;
}


const getStatus = (type) => {
    switch (type) {
        case 'GENERAL':
            return { text: 'General', cls: 'bg-emerald-50 text-emerald-600 ring-emerald-100' }
        case 'POPULAR':
            return { text: 'Popular', cls: 'bg-blue-50 text-blue-600 ring-blue-100' }
        case 'PACKAGE':
            return { text: 'Package', cls: 'bg-purple-50 text-purple-600 ring-purple-100' }
        default:
            return { text: 'Unknown', cls: 'bg-gray-50 text-gray-400 ring-gray-100' }
    }
}
</script>


<template>
    <div class="bg-white rounded-[40px]
           shadow-[0_20px_60px_rgba(0,0,0,0.05)]
           border border-gray-100 overflow-hidden">
        <table class="w-full text-left">
            <!-- HEADER -->
            <thead>
                <tr class="bg-gray-50/40 border-b border-gray-100">
                    <th class="pl-10 pr-6 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Course
                    </th>
                    <th class="px-6 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Instructor
                    </th>
                    <th class="px-6 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Price
                    </th>
                    <th class="px-6 py-6 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Status
                    </th>
                    <th class="px-10 py-6"></th>
                </tr>
            </thead>

            <!-- EMPTY -->
            <tbody v-if="course.length === 0">
                <tr>
                    <td colspan="5" class="py-28 text-center">
                        <div class="flex flex-col items-center gap-4 text-slate-300">
                            <BookOpen size="44" />
                            <p class="text-sm font-semibold">No courses found</p>
                            <p class="text-xs">Create your first course to get started</p>
                        </div>
                    </td>
                </tr>
            </tbody>

            <!-- DATA -->
            <tbody v-else class="divide-y divide-gray-100">
                <tr v-for="c in course" :key="c.id" class="group hover:bg-slate-50/60 transition-colors duration-300">
                    <!-- COURSE -->
                    <td class="pl-10 pr-6 py-7">
                        <div class="flex items-center gap-5">
                            <div class="w-24 h-14 rounded-[18px] overflow-hidden shadow-sm">
                                <img v-if="getCourseImage(c.image)" :src="getCourseImage(c.image)" alt="Course Image"
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center text-xs">
                                    NO IMAGE
                                </div>
                            </div>

                            <div>
                                <p class="font-bold text-[15px] text-slate-700
                         group-hover:text-blue-600 transition-colors">
                                    {{ c.title }}
                                </p>
                                <p class="text-[10px] mt-1 font-semibold uppercase tracking-wider text-slate-300">
                                    {{ c.category?.name || 'General' }}
                                </p>
                            </div>
                        </div>
                    </td>

                    <!-- INSTRUCTOR -->
                    <td class="px-6 py-7">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full bg-slate-100 border border-white
             shadow-sm flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">

                                <!-- ถ้ามีรูป -->
                                <img v-if="getUserProfileImage(c.teacher)" :src="getUserProfileImage(c.teacher)"
                                    class="w-full h-full object-cover" />

                                <!-- ถ้าไม่มีรูปแต่มีชื่อ -->
                                <span v-else-if="getUserInitial(c.teacher)" class="text-sm font-black">
                                    {{ getUserInitial(c.teacher) }}
                                </span>

                                <!-- ถ้าไม่มีรูปและไม่มีชื่อ -->
                                <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center text-xs">
                                    NO IMAGE
                                </div>

                            </div>

                            <p class="text-[13px] font-semibold text-slate-600">
                                {{ c.teacher?.name || 'Unknown' }}
                            </p>
                        </div>
                    </td>


                    <!-- PRICE -->
                    <td class="px-6 py-7">
                        <span class="font-bold text-slate-700">
                            ฿{{ c.price.toLocaleString() }}
                        </span>
                    </td>

                    <!-- STATUS -->
                    <td class="px-6 py-7">
                        <span :class="getStatus(c.type).cls" class="inline-flex items-center px-4 py-1.5
                     rounded-full text-[10px] font-bold ring-1">
                            {{ getStatus(c.type).text }}
                        </span>
                    </td>

                    <!-- ACTIONS -->
                    <td class="pl-6 pr-10 py-7 text-right">
                        <div class="flex justify-end gap-1">
                            <button @click="$emit('view', c)"
                                class="p-2 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                title="ดูรายละเอียด">
                                <Eye :size="18" />
                            </button>

                            <button @click="$emit('edit', c)"
                                class="p-2 rounded-xl text-slate-300 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                                title="แก้ไขคอร์ส">
                                <Pencil :size="18" />
                            </button>

                            <button @click="$emit('delete', c)"
                                class="p-2 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="ลบคอร์ส">
                                <Trash2 :size="18" />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

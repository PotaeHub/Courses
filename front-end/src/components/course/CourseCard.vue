<script setup>
defineProps({
    course: {
        type: Object,
        required: true
    }
})

const BASE_URL = import.meta.env.VITE_BACKEND_URL
</script>

<template>
  <router-link :to="{ name: 'student-course-detail', params: { id: course.id } }" class="group block">
    <div
      class="bg-white rounded-[2.5rem] p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 h-[450px] flex flex-col relative"
    >
      <div class="relative h-[220px] rounded-[1.8rem] overflow-hidden bg-gray-50 mb-5">
        <img
          v-if="course.image"
          :src="`${BASE_URL}${course.image}`"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-300 text-sm italic font-medium">
          No Preview Image
        </div>

        <div 
          v-if="course.rating >= 4.8"
          class="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] shadow-sm border border-white/20"
        >
          Bestseller
        </div>
      </div>

      <div class="flex flex-col flex-1 px-1">
        <h3 class="text-lg font-semibold text-gray-900 leading-[1.4] line-clamp-2 mb-3 min-h-[50px] tracking-tight group-hover:text-indigo-600 transition-colors">
          {{ course.title }}
        </h3>

        <div class="flex items-center gap-2.5 mb-4">
          <div class="flex-shrink-0">
            <img
              v-if="course.teacher?.image"
              :src="`${BASE_URL}${course.teacher.image}`"
              class="w-7 h-7 rounded-full object-cover ring-2 ring-gray-50"
            />
            <div
              v-else
              class="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-400"
            >
              {{ course.teacher?.name?.charAt(0) }}
            </div>
          </div>
          <span class="text-xs font-semibold text-gray-400 tracking-tight">
            {{ course.teacher?.name || 'ผู้สอน' }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 mb-6">
          <div class="flex items-center bg-amber-50/50 px-2 py-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-amber-400 fill-current mr-1" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="text-xs font-bold text-amber-700">{{ course.rating || '0.0' }}</span>
          </div>
          <span class="text-[11px] text-gray-300 font-medium">(1,250 reviews)</span>
        </div>

        <div class="mt-auto flex items-end justify-between border-t border-gray-50 pt-5">
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-0.5">Investment</span>
            <span class="text-2xl font-bold text-gray-900 tracking-tighter">
              ฿{{ course.price.toLocaleString() }}
            </span>
          </div>

          <div class="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:bg-indigo-600 group-hover:shadow-indigo-100 transition-all duration-500 transform group-hover:rotate-[360deg]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

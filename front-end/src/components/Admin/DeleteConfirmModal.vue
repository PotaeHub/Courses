<script setup>
defineProps({
  show: Boolean,
  title: {
    type: String,
    default: "ยืนยันการลบ"
  },
  message: {
    type: String,
    default: "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
  }
});

defineEmits(["close", "confirm"]);
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-xl animate-fade-in">

      <h2 class="text-xl font-black mb-3">{{ title }}</h2>
      <p class="text-gray-600 mb-6">{{ message }}</p>

      <div class="flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-5 py-2 rounded-xl border-2 border-black font-bold hover:bg-gray-100"
        >
          ยกเลิก
        </button>

        <button
          @click="$emit('confirm')"
          class="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
        >
          ลบ
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.15s ease-out;
}
</style>

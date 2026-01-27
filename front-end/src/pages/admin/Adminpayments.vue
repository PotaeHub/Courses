<script setup>
import { onMounted, ref } from "vue"
import Swal from "sweetalert2" // ต้องติดตั้ง npm install sweetalert2
import api from "../../service/api"

const payments = ref([])
const loading = ref(false)

const fetchPayments = async () => {
    loading.value = true
    try {
        const res = await api.get("/admin/payments")
        payments.value = res.data
    } catch (error) {
        console.error("Error fetching payments:", error)
    } finally {
        loading.value = false
    }
}

const confirmPayment = async (id) => {
    // 1. ถามยืนยันก่อนอนุมัติ
    const result = await Swal.fire({
        title: 'ยืนยันการอนุมัติ?',
        text: "เมื่ออนุมัติแล้ว ผู้เรียนจะสามารถเข้าถึงคอร์สเรียนได้ทันที",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5', // สี indigo-600
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ยืนยันการชำระเงิน',
        cancelButtonText: 'ตรวจสอบอีกครั้ง',
        reverseButtons: true,
        customClass: {
            popup: 'rounded-[2rem]',
            confirmButton: 'rounded-xl px-5 py-2.5 text-sm',
            cancelButton: 'rounded-xl px-5 py-2.5 text-sm'
        }
    })

    if (result.isConfirmed) {
        try {
            // แสดง Loading ขณะรอ API
            Swal.showLoading()

            await api.patch(`/payments/${id}/confirm`)

            // 2. แจ้งเตือนเมื่อสำเร็จ (ใช้แบบ Toast มุมขวาบน)
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            })

            Toast.fire({
                icon: 'success',
                title: 'อนุมัติการชำระเงินเรียบร้อย'
            })

            fetchPayments() // โหลดข้อมูลใหม่
        } catch (error) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถอนุมัติรายการได้ กรุณาลองใหม่',
                icon: 'error',
                customClass: { popup: 'rounded-[2rem]' }
            })
        }
    }
}

onMounted(fetchPayments)
</script>

<template>
    <div class="p-8 bg-[#FAFAFB] min-h-screen antialiased font-sans">
        <div class="max-w-6xl mx-auto">

            <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 tracking-tight">ตรวจสอบการชำระเงิน</h1>
                    <p class="text-gray-500 text-sm mt-1 font-medium">
                        จัดการรายการโอนเงินและอนุมัติการเข้าเรียนอย่างเป็นระบบ</p>
                </div>
                <div
                    class="inline-flex items-center bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-gray-600">
                    <span class="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse mr-3"></span>
                    รอตรวจสอบ {{payments.filter(p => p.status === 'PENDING').length}} รายการ
                </div>
            </div>

            <div class="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50/40 border-b border-gray-100">
                            <th class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                ผู้เรียน</th>
                            <th class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">คอร์ส
                            </th>
                            <th
                                class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 text-center">
                                ราคา</th>
                            <th
                                class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 text-center">
                                หลักฐาน</th>
                            <th
                                class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 text-center">
                                สถานะ</th>
                            <th
                                class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 text-right">
                                การจัดการ</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="p in payments" :key="p.id"
                            class="hover:bg-gray-50/50 transition-all duration-200 group">
                            <td class="px-8 py-6">
                                <div class="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{{
                                    p.user.name }}</div>
                                <div class="text-[11px] text-gray-400 mt-1 font-semibold tracking-wider uppercase">Order
                                    ID: #{{ p.id }}</div>
                            </td>
                            <td class="px-8 py-6">
                                <div class="text-sm font-semibold text-gray-700 line-clamp-1 max-w-[220px]">{{
                                    p.course.title }}</div>
                            </td>
                            <td class="px-8 py-6 text-center">
                                <span class="text-sm font-black text-gray-900">฿{{ p.amount.toLocaleString() }}</span>
                            </td>
                            <td class="px-8 py-6 text-center">
                                <a :href="p.slip" target="_blank"
                                    class="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 border border-gray-200 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </a>
                            </td>
                            <td class="px-8 py-6 text-center">
                                <span v-if="p.status === 'PENDING'"
                                    class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                                    รออนุมัติ
                                </span>
                                <span v-else
                                    class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    สำเร็จแล้ว
                                </span>
                            </td>
                            <td class="px-8 py-6 text-right">
                                <button v-if="p.status === 'PENDING'" @click="confirmPayment(p.id)"
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all active:scale-90 shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200">
                                    อนุมัติ
                                </button>
                                <div v-else class="flex items-center justify-end text-emerald-500">
                                    <div class="bg-emerald-100 p-1 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                            fill="currentColor">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <span class="ml-2 text-xs font-bold uppercase tracking-tighter">Verified</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="payments.length === 0" class="py-24 text-center">
                    <div class="text-gray-200 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p class="text-gray-400 font-medium tracking-wide">ไม่พบรายการชำระเงินในขณะนี้</p>
                </div>
            </div>
        </div>
    </div>
</template>
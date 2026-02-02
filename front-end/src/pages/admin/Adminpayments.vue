<script setup>
import { onMounted, ref } from "vue"
import Swal from "sweetalert2"
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
    const result = await Swal.fire({
        title: "ยืนยันการอนุมัติ?",
        text: "เมื่ออนุมัติแล้ว ผู้เรียนจะสามารถเข้าถึงคอร์สเรียนได้ทันที",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#4f46e5",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "ยืนยันการชำระเงิน",
        cancelButtonText: "ตรวจสอบอีกครั้ง",
        reverseButtons: true,
        customClass: {
            popup: "rounded-[2rem]",
            confirmButton: "rounded-xl px-5 py-2.5 text-sm",
            cancelButton: "rounded-xl px-5 py-2.5 text-sm"
        }
    })

    if (!result.isConfirmed) return

    try {
        Swal.showLoading()

        // ✅ route ตรง backend
        await api.post(`/admin/payments/${id}/approve`)

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "อนุมัติการชำระเงินเรียบร้อย",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        })

        fetchPayments()
    } catch (error) {
        console.error(error)
        Swal.fire({
            title: "เกิดข้อผิดพลาด!",
            text: "ไม่สามารถอนุมัติรายการได้ กรุณาลองใหม่",
            icon: "error",
            customClass: { popup: "rounded-[2rem]" }
        })
    }
}

onMounted(fetchPayments)
</script>

<template>
    <div class="p-8 bg-[#FAFAFB] min-h-screen antialiased font-sans">
        <div class="max-w-6xl mx-auto">

            <!-- HEADER -->
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
                        ตรวจสอบการชำระเงิน
                    </h1>
                    <p class="text-gray-500 text-sm mt-1 font-medium">
                        จัดการรายการโอนเงินและอนุมัติการเข้าเรียน
                    </p>
                </div>

                <div
                    class="inline-flex items-center bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-gray-600">
                    <span class="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse mr-3"></span>
                    รอตรวจสอบ
                    {{payments.filter(p => p.status === 'WAITING_CONFIRM').length}}
                    รายการ
                </div>
            </div>

            <!-- TABLE -->
            <div class="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50/40 border-b border-gray-100">
                            <th class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                ผู้เรียน
                            </th>
                            <th class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                คอร์ส
                            </th>
                            <th
                                class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 text-center">
                                ราคา
                            </th>
                            <th
                                class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 text-center">
                                หลักฐาน
                            </th>
                            <th
                                class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 text-center">
                                สถานะ
                            </th>
                            <th
                                class="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 text-right">
                                การจัดการ
                            </th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="p in payments" :key="p.id"
                            class="hover:bg-gray-50/50 transition-all duration-200 group">
                            <td class="px-8 py-6">
                                <div class="font-bold text-gray-900 group-hover:text-indigo-600">
                                    {{ p.user.name }}
                                </div>
                                <div class="text-[11px] text-gray-400 mt-1 font-semibold uppercase">
                                    Payment ID: #{{ p.id }}
                                </div>
                            </td>

                            <td class="px-8 py-6">
                                <div class="text-sm font-semibold text-gray-700 line-clamp-1 max-w-[220px]">
                                    {{ p.course.title }}
                                </div>
                            </td>

                            <td class="px-8 py-6 text-center">
                                <span class="text-sm font-black text-gray-900">
                                    ฿{{ p.amount.toLocaleString() }}
                                </span>
                            </td>

                            <td class="px-8 py-6 text-center">
                                <a :href="p.slip" target="_blank"
                                    class="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white text-gray-400 hover:bg-indigo-600 hover:text-white transition-all border border-gray-200">
                                    📄
                                </a>
                            </td>

                            <td class="px-8 py-6 text-center">
                                <span v-if="p.status === 'WAITING_CONFIRM'"
                                    class="inline-flex px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-100">
                                    รออนุมัติ
                                </span>

                                <span v-else-if="p.status === 'COMPLETED'"
                                    class="inline-flex px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    สำเร็จแล้ว
                                </span>
                            </td>

                            <td class="px-8 py-6 text-right">
                                <button v-if="p.status === 'WAITING_CONFIRM'" @click="confirmPayment(p.id)"
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold uppercase px-6 py-2.5 rounded-xl shadow">
                                    อนุมัติ
                                </button>

                                <span v-else class="text-emerald-500 text-xs font-bold uppercase">
                                    VERIFIED
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="payments.length === 0" class="py-24 text-center text-gray-400">
                    ไม่พบรายการชำระเงิน
                </div>
            </div>
        </div>
    </div>
</template>

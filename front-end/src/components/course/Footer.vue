<template>
    <footer class="bg-slate-900 text-gray-300 pt-20 pb-10">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                <div class="space-y-6">
                    <div class="flex items-center space-x-2">
                        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <span class="text-white font-bold text-xl">L</span>
                        </div>
                        <span class="text-white text-2xl font-bold tracking-tight">LearnHub</span>
                    </div>
                    <p class="text-gray-400 leading-relaxed">
                        แพลตฟอร์มการเรียนรู้ออนไลน์ที่มุ่งเน้นการพัฒนาทักษะแห่งอนาคต
                        เพื่อให้ทุกคนก้าวทันโลกเทคโนโลยีที่ไม่หยุดนิ่ง
                    </p>
                    <div class="flex space-x-4">
                        <a href="#"
                            class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="#"
                            class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-400 transition-colors">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#"
                            class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-600 transition-colors">
                            <i class="fab fa-youtube"></i>
                        </a>
                    </div>
                </div>

                <div>
                    <h4 class="text-white font-semibold text-lg mb-6">ลิงก์ด่วน</h4>
                    <ul class="space-y-4">
                        <li><a href="#" class="hover:text-blue-400 transition-colors">คอร์สทั้งหมด</a></li>
                        <li><a href="#" class="hover:text-blue-400 transition-colors">เกี่ยวกับเรา</a></li>
                        <li><a href="#" class="hover:text-blue-400 transition-colors">ร่วมเป็นผู้สอน</a></li>
                        <li><a href="#" class="hover:text-blue-400 transition-colors">คำถามที่พบบ่อย (FAQ)</a></li>
                        <li><a href="#" class="hover:text-blue-400 transition-colors">บทความ/บล็อก</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-white font-semibold text-lg mb-6">หมวดหมู่ยอดนิยม</h4>
                    <ul class="space-y-4">
                        <li><a href="#" class="hover:text-blue-400 transition-colors">การพัฒนาเว็บ (Web Dev)</a></li>
                        <li><a href="#" class="hover:text-blue-400 transition-colors">การตลาดดิจิทัล</a></li>
                        <li><a href="#" class="hover:text-blue-400 transition-colors">วิทยาศาสตร์ข้อมูล (Data
                                Science)</a></li>
                        <li><a href="#" class="hover:text-blue-400 transition-colors">การออกแบบ UI/UX</a></li>
                        <li><a href="#" class="hover:text-blue-400 transition-colors">ธุรกิจและการเป็นผู้ประกอบการ</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-white font-semibold text-lg mb-6">รับข่าวสารคอร์สใหม่</h4>
                    <p class="text-sm text-gray-400 mb-4">ไม่พลาดคอร์สเรียนเปิดใหม่และโปรโมชั่นพิเศษ</p>
                    <form class="space-y-3">
                        <input type="email" placeholder="อีเมลของคุณ"
                            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white">
                        <button
                            class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                            ติดตามข่าวสาร
                        </button>
                    </form>
                    <div class="mt-6 flex items-start space-x-3 text-sm">
                        <span class="text-blue-400"><i class="fas fa-envelope"></i></span>
                        <span>support@learnhub.com</span>
                    </div>
                </div>

            </div>

            <div
                class="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500">
                <p>© 2024 LearnHub Online. All Rights Reserved.</p>
                <div class="flex space-x-6">
                    <a href="#" class="hover:text-gray-300">ข้อกำหนดการใช้งาน</a>
                    <a href="#" class="hover:text-gray-300">นโยบายความเป็นส่วนตัว</a>
                    <a href="#" class="hover:text-gray-300">นโยบายคุกกี้</a>
                </div>
            </div>
        </div>
    </footer>
</template>
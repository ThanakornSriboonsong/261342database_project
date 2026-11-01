<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Prices are per bunch (หวี) unless the name says otherwise.
     * A few items are low or out of stock so the admin dashboard has something to show.
     */
    public function run(): void
    {
        foreach ([
            ['name' => 'Cavendish Banana', 'detail' => 'กล้วยหอมคาเวนดิช ผลใหญ่ เนื้อเนียน หวานกำลังดี เหมาะกินสดหรือทำสมูทตี้', 'price' => 59, 'stock' => 60],
            ['name' => 'Hom Thong Banana', 'detail' => 'กล้วยหอมทอง กลิ่นหอมเป็นเอกลักษณ์ เนื้อนุ่ม หวานหอม', 'price' => 79, 'stock' => 45],
            ['name' => 'Namwa Banana', 'detail' => 'กล้วยน้ำว้า เนื้อแน่น ใช้ได้ทั้งกินสด ปิ้ง และทำขนม', 'price' => 45, 'stock' => 80],
            ['name' => 'Khai Banana', 'detail' => 'กล้วยไข่ ลูกเล็ก เปลือกบาง หวานอมเปรี้ยวนิดๆ', 'price' => 55, 'stock' => 50],
            ['name' => 'Lady Finger Banana', 'detail' => 'กล้วยเล็บมือนาง ลูกเล็กเรียว หอมหวาน เนื้อเหนียวนุ่ม', 'price' => 65, 'stock' => 30],
            ['name' => 'Red Banana', 'detail' => 'กล้วยเปลือกแดง เนื้อสีครีมอมชมพู รสหวานคล้ายราสเบอร์รี', 'price' => 120, 'stock' => 4],
            ['name' => 'Blue Java Banana', 'detail' => 'กล้วยไอศกรีม เปลือกสีฟ้าอมเงิน เนื้อนุ่มฟูคล้ายวานิลลาไอศกรีม', 'price' => 180, 'stock' => 0],
            ['name' => 'Plantain', 'detail' => 'กล้วยสำหรับทำอาหาร เนื้อแน่น เหมาะทอด อบ หรือต้ม', 'price' => 70, 'stock' => 25],
            ['name' => 'Burro Banana', 'detail' => 'กล้วยทรงเหลี่ยม รสหวานอมเปรี้ยวคล้ายมะนาว', 'price' => 85, 'stock' => 3],
            ['name' => 'Manzano Banana', 'detail' => 'กล้วยแอปเปิล ลูกสั้น กลิ่นหอมคล้ายแอปเปิลและสตรอว์เบอร์รี', 'price' => 95, 'stock' => 20],
            ['name' => 'Banana Chips (100 g)', 'detail' => 'กล้วยฉาบกรอบ หวานน้อย อบไม่ทอด', 'price' => 39, 'stock' => 100],
            ['name' => 'Sun-dried Banana (200 g)', 'detail' => 'กล้วยตากพลังงานแสงอาทิตย์ หนึบหวานธรรมชาติ ไม่เติมน้ำตาล', 'price' => 49, 'stock' => 70],
        ] as $product) {
            Product::create([...$product, 'image_url' => null]);
        }
    }
}

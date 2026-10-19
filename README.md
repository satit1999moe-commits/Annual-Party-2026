# ระบบจองโต๊ะ จำหน่ายบัตร และบริหารจัดการงานเลี้ยงประจำปี
## โรงเรียนสาธิตอุดมศึกษา (Satit Udomseuksa School Ticketing System)

ระบบบริหารจัดการการจองโต๊ะ จำหน่ายบัตร เช็คอินด้วย QR Code และตรวจสอบการเงินสำหรับงานเลี้ยงประจำปี พัฒนาด้วย React 19, TypeScript, Tailwind CSS, และ Express พร้อมสถาปัตยกรรม Local-First & Cloud-Ready รองรับการทำงานแบบเรียลไทม์ และเตรียมพร้อมสำหรับการเผยแพร่ผ่าน GitHub และ Vercel.com

---

### ✨ ฟีเจอร์หลัก (Key Features)

1. **ผังที่นั่งโต้ะจีน 120 โต๊ะ (Seating Map 120 Tables × 8 Seats = 960 Seats)**
   - แสดงสถานะที่นั่งแบบเรียลไทม์: ว่าง (Available), จองแล้ว (Booked), และยกเลิก (Cancelled)
   - รองรับการเลือกที่นั่งเดี่ยว หรือเหมาโต๊ะในราคาพิเศษ
   - รองรับการค้นหาโต๊ะและซูมดูรายละเอียด

2. **ระบบการจองที่รวดเร็ว (Instant Booking & Form Reset)**
   - บันทึกข้อมูลผู้ปกครองและนักเรียนครบถ้วน (ระดับชั้น อนุบาล - ม.6, ห้อง, โปรแกรม TP/EP)
   - **ปุ่ม "บันทึก & จองคนถัดไปทันที"**: บันทึกข้อมูลและล้างฟอร์มให้ว่างทันที พร้อมโฟกัสช่องชื่อผู้ปกครองเพื่อรับผู้จองคนต่อไปอย่างต่อเนื่อง
   - ป้องกัน Browser Auto-fill ที่อาจทำให้ข้อมูลปนเปื้อน

3. **ผู้ดูแลระบบระดับสูง (Super Admin Role - Fully Embedded)**
   - ข้อมูลผู้ดูแลระบบ Super Admin ทั้ง 7 ท่าน ถูกฝังในโค้ดระบบโดยตรง ไม่ต้องพึ่งพาชีตผู้ใช้งานใน Google Sheets
   - เข้าถึงได้ทุกฟังก์ชัน: ผังที่นั่ง, รายการจอง, การเงิน, จัดการผู้ใช้, รายงาน Analytics, ตรวจสอบ Audit Log, และการตั้งค่าระบบ
   - ไม่แสดงรหัสผ่านหรือข้อมูลการล็อกอินในหน้าจอเพื่อความปลอดภัยสูงสุด

4. **การเงินและการชำระเงิน (Payment & Slip Verification)**
   - ตรวจสอบสลิปโอนเงิน อนุมัติการชำระเงิน หรือปฏิเสธพร้อมบันทึกเหตุผล
   - ส่งออกข้อมูลการจองและการเงินเป็นไฟล์ Excel (.xlsx)

5. **บัตรเข้างาน & สแกนเนอร์เช็คอิน (E-Ticket & QR Check-in)**
   - สร้างบัตรดิจิทัลและพิมพ์ใบเสร็จ/บัตรเข้างาน
   - สแกน QR Code สำหรับลงทะเบียนหน้างาน พร้อมระบบป้องกันการสแกนซ้ำ

6. **ระบบซิงค์ Google Sheets (Google Sheets Integration)**
   - เชื่อมต่อ Google Spreadsheet ID: `181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw`
   - ซิงค์ 9 แผ่นงานอัตโนมัติ

---

### 🚀 คู่มือการนำขึ้น GitHub และ Vercel (Deployment Guide)

#### ขั้นตอนที่ 1: อัปโหลดขึ้น GitHub
1. สร้าง Repository ใหม่บน GitHub (เช่น `satit-ticketing-system`)
2. ดำเนินการ Commit และ Push โค้ด:
```bash
git init
git add .
git commit -m "Initial commit for Satit Ticketing System"
git branch -M main
git remote add origin https://github.com/<your-username>/satit-ticketing-system.git
git push -u origin main
```

#### ขั้นตอนที่ 2: เผยแพร่ผ่าน Vercel (Deploy to Vercel)
1. ไปที่ [vercel.com](https://vercel.com) และเข้าสู่ระบบ
2. คลิก **"Add New..."** -> **"Project"**
3. เลือก Repository จาก GitHub ที่เพิ่ง Push ขึ้นไป
4. ในหน้าตั้งค่าโปรเจกต์:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. คลิก **"Deploy"**
6. ระบบจะดำเนินการสร้าง (Build) และส่งมอบ URL สดของระบบให้ทันที เช่น `https://satit-ticketing-system.vercel.app`

> **หมายเหตุพิเศษสำหรับการทำงานบน Vercel:**
> ระบบได้รับการพัฒนาให้มีสถาปัตยกรรม **Dual-Layer Resilience**:
> ไม่ว่าจะทำงานร่วมกับ Backend Server หรือทำงานบน Vercel CDN ระบบจะจัดเก็บและประมวลผลข้อมูลผ่าน Local Database Engine อย่างสมบูรณ์แบบโดยไม่มี Syntax Error หรือ Token Mismatch ใดๆ ทั้งสิ้น

---

### 👥 ข้อมูลบัญชี Super Admin สำหรับผู้ดูแลระบบ

ผู้ดูแลระบบทั้ง 7 ท่านสามารถเข้าสู่ระบบด้วยหมายเลขโทรศัพท์ของตนเอง:
1. **0833759527** - นายพสิษฐ์ สัตบุตร (Super Admin)
2. **0924606190** - นางสาวเพชรพัชรี สุระปัญญา (Super Admin)
3. **0652630965** - นายเสฏฐวุฒิ แก้วมรกต (Super Admin)
4. **0970601930** - นางนราวรรณ สุ่นตระกูล (Super Admin)
5. **0610567914** - นางสาวพัณณิตา เป็นทุน (Super Admin)
6. **0915519538** - นางเพ็ญศรี ไชยสลี (Super Admin)
7. **0802105933** - นางปราณี เรียนรู้ (Super Admin)

---

### 💻 คำสั่งสำหรับนักพัฒนา (Development Commands)

- เริ่มต้นเซิร์ฟเวอร์พัฒนา: `npm run dev`
- ตรวจสอบ TypeScript Lint: `npm run lint`
- สร้างไฟล์ Production: `npm run build`
- รันเซิร์ฟเวอร์ Node.js: `npm start`

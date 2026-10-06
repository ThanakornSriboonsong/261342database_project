# 🍌 Banana Shop

เว็บร้านขายกล้วยหลากสายพันธุ์ (Term Project วิชา 261342 Database)
สร้างด้วย **Laravel 13 + Livewire starter kit** รันบน **Laravel Sail (Docker) + MySQL 8.4**

---

## สารบัญ
1. [เตรียมเครื่อง (ครั้งเดียว)](#1-เตรียมเครื่อง-ครั้งเดียว)
2. [ดาวน์โหลดโปรเจกต์และรันครั้งแรก](#2-ดาวน์โหลดโปรเจกต์และรันครั้งแรก)
3. [เริ่ม/เลิกงานทุกวัน](#3-เริ่มเลิกงานทุกวัน)
4. [ทำงานร่วมกันด้วย Git + GitHub](#4-ทำงานร่วมกันด้วย-git--github)
5. [กฎของทีม](#5-กฎของทีม)
6. [คำสั่งที่ใช้บ่อย](#6-คำสั่งที่ใช้บ่อย)
7. [แก้ปัญหาที่เจอบ่อย](#7-แก้ปัญหาที่เจอบ่อย)

---

## 1. เตรียมเครื่อง (ครั้งเดียว)

> คำสั่งทั้งหมดในไฟล์นี้ให้พิมพ์ใน **Ubuntu (WSL)** ยกเว้นที่เขียนว่า *PowerShell*

### 1.1 ติดตั้งโปรแกรม
| โปรแกรม | ใช้ทำอะไร |
|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | รัน PHP + MySQL ใน container |
| WSL2 + Ubuntu | Linux ใน Windows — เปิด **PowerShell (Run as Administrator)** แล้วพิมพ์ `wsl --install -d Ubuntu` แล้ว restart เครื่อง |
| [VS Code](https://code.visualstudio.com/) + extension **WSL** | เขียนโค้ด |
| [DBeaver](https://dbeaver.io/) (ไม่บังคับ) | ดูข้อมูลใน database |

### 1.2 ตั้งค่า Docker Desktop
**Settings → Resources → WSL integration** → เปิดสวิตช์ Ubuntu → Apply & restart

### 1.3 ตั้ง Ubuntu เป็นค่าเริ่มต้นของ WSL (*PowerShell*)
```powershell
wsl -l -v                       # ดูชื่อ Ubuntu ของตัวเอง เช่น Ubuntu หรือ Ubuntu-24.04
wsl --set-default <ชื่อ Ubuntu>
```
> ถ้าไม่ทำ พิมพ์ `wsl` แล้วจะเข้า `docker-desktop` แทน (prompt ขึ้น `#`) และใช้ docker ไม่ได้

### 1.4 ตั้งค่า Git และล็อกอิน GitHub (ใน Ubuntu)
```bash
git config --global user.name "ชื่อของคุณ"
git config --global user.email "อีเมลที่ใช้สมัคร GitHub"
git config --global init.defaultBranch main

sudo apt update && sudo apt install -y gh
gh auth login
```
ตอบตามนี้: `GitHub.com` → `HTTPS` → `Yes` → `Login with a web browser`
แล้วเปิด **https://github.com/login/device** ในเบราว์เซอร์ Windows ใส่รหัส 8 ตัวที่ขึ้นใน terminal

### 1.5 ตั้ง alias `sail`
```bash
echo "alias sail='sh \$([ -f sail ] && echo sail || echo vendor/bin/sail)'" >> ~/.bashrc && source ~/.bashrc
```

---

## 2. ดาวน์โหลดโปรเจกต์และรันครั้งแรก

> ⚠️ เก็บโปรเจกต์ไว้ใน `~/projects` (ฝั่ง Linux) **ห้าม**เก็บใน `/mnt/c/...` เพราะจะช้ามาก

```bash
# 1) ดาวน์โหลดโค้ด
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/ThanakornSriboonsong/261342database_project.git banana-shop
cd banana-shop

# 2) ติดตั้ง PHP packages (โฟลเดอร์ vendor/) ผ่าน docker
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd):/var/www/html" -w /var/www/html \
  laravelsail/php84-composer:latest composer install --ignore-platform-reqs

# 3) สร้างไฟล์ตั้งค่า
cp .env.example .env

# 4) เปิด container (ครั้งแรกจะนานหลายนาที)
sail up -d

# 5) ตั้งค่าแอป + ติดตั้ง JS + สร้างตาราง
sail artisan key:generate
sail npm install
sail npm run build
sail artisan migrate --seed
```
> ถ้า `migrate` ขึ้น `Connection refused` = MySQL ยังเปิดไม่เสร็จ รอ 30 วินาทีแล้วลองใหม่ (เช็กด้วย `sail ps` ต้องเห็น `healthy`)

เปิด **http://localhost** → ถ้าเห็นหน้าเว็บ = สำเร็จ 🎉
เปิดโค้ดใน VS Code: `code .`

### ยืนยันอีเมลตอนทดสอบ
ตอนนี้แอปยังไม่ส่งอีเมลจริง (`MAIL_MAILER=log`) หลังสมัครสมาชิกให้ยืนยันเองด้วย:
```bash
sail artisan tinker
>>> App\Models\User::where('email', 'อีเมลที่สมัคร')->first()->markEmailAsVerified();
>>> exit
```

### เชื่อม DBeaver
Host `localhost` · Port `3306` · Database `banana_shop` · User `sail` · Password `password`
(ถ้าขึ้น *Public Key Retrieval is not allowed* → Driver properties → `allowPublicKeyRetrieval` = `true`)

---

## 3. เริ่ม/เลิกงานทุกวัน

```bash
cd ~/projects/banana-shop
sail up -d            # เปิด container
git checkout main
git pull              # ดึงโค้ดล่าสุดของเพื่อน
sail composer install # ถ้าเพื่อนเพิ่ม PHP package
sail npm install      # ถ้าเพื่อนเพิ่ม JS package
sail artisan migrate  # ถ้าเพื่อนเพิ่มตาราง
sail npm run dev      # เปิดค้างไว้ตอนเขียนโค้ด (เซฟแล้วหน้าเว็บรีเฟรชเอง)
```
เลิกงาน: `Ctrl+C` เพื่อหยุด `npm run dev` แล้ว `sail stop`

---

## 4. ทำงานร่วมกันด้วย Git + GitHub

### คำศัพท์ที่ต้องรู้
| คำ | ความหมาย |
|---|---|
| **repository (repo)** | โฟลเดอร์โปรเจกต์ที่ git จำประวัติทุกการแก้ไข |
| **commit** | การ "เซฟจุด" พร้อมข้อความบอกว่าแก้อะไร |
| **branch** | สำเนาแยกของโค้ดไว้ทำงานของเรา ไม่กระทบคนอื่น |
| **main** | branch หลัก = โค้ดที่ใช้งานได้จริง **ห้ามแก้ตรงๆ** |
| **push** | ส่ง commit จากเครื่องเราขึ้น GitHub |
| **pull** | ดึงของใหม่จาก GitHub ลงเครื่องเรา |
| **Pull Request (PR)** | ขอให้เพื่อนตรวจโค้ด แล้ว merge branch เราเข้า main |
| **merge conflict** | สองคนแก้บรรทัดเดียวกัน git เลยถามว่าจะเอาของใคร |

### ขั้นตอนทำงาน 1 ชิ้น (ทำแบบนี้ทุกครั้ง)

```bash
# ① อัปเดต main ให้ล่าสุด
git checkout main
git pull

# ② สร้าง branch ใหม่สำหรับงานนี้
git checkout -b feature/cart

# ③ เขียนโค้ด... แล้ว commit บ่อยๆ
git status                         # ดูว่าแก้ไฟล์ไหนไปบ้าง
git add .
git commit -m "feat(cart): add product to cart"

# ④ ส่งขึ้น GitHub
git push -u origin feature/cart    # ครั้งแรกของ branch นี้
git push                           # ครั้งต่อๆ ไป
```

**⑤ เปิด Pull Request บนเว็บ**
1. เข้าหน้า repo บน GitHub → จะมีแถบเหลือง **Compare & pull request** → กด
2. เขียนหัวข้อ + อธิบายว่าทำอะไร
3. ขวามือ **Reviewers** → เลือกเพื่อน 1 คน → **Create pull request**

**⑥ เพื่อนรีวิว** → แท็บ **Files changed** → **Review changes** → **Approve**

**⑦ Merge** → กด **Squash and merge** → **Delete branch**

**⑧ กลับมาที่เครื่อง** แล้วเริ่มงานชิ้นต่อไปจากข้อ ①
```bash
git checkout main
git pull
git branch -d feature/cart   # ลบ branch เก่าในเครื่อง
```

### ถ้า main มีของใหม่ระหว่างที่เรายังทำ branch อยู่
```bash
git checkout main && git pull
git checkout feature/cart
git merge main
```
ถ้าขึ้น **CONFLICT** → เปิดไฟล์นั้นใน VS Code จะเห็นปุ่ม
**Accept Current** (ของเรา) / **Accept Incoming** (ของ main) / **Accept Both** → เลือกให้ถูก → เซฟ แล้ว
```bash
git add .
git commit -m "merge main into feature/cart"
```
ไม่แน่ใจ → **ถามเจ้าของโค้ดอีกฝั่งก่อน** อย่ากดมั่ว

### ตั้งชื่อ branch / commit
- branch: `feature/<งาน>`, `fix/<บั๊ก>` เช่น `feature/wishlist`, `fix/cart-total`
- commit: `feat: ...`, `fix: ...`, `style: ...`, `docs: ...`

---

## 5. กฎของทีม

1. ❌ **ห้าม push เข้า `main` ตรงๆ** — ทุกอย่างผ่าน Pull Request
2. ❌ **ห้าม `git push --force`**
3. ❌ **ห้าม commit `.env`** (มีรหัสผ่าน/APP_KEY) — ถ้าเพิ่มค่าใหม่ใน `.env` ให้เพิ่มใน `.env.example` ด้วย
4. ❌ **ห้ามแก้ไฟล์ migration ที่ merge เข้า main แล้ว** — จะเปลี่ยนตารางให้สร้าง migration ใหม่ เช่น
   `sail artisan make:migration add_points_to_users_table`
5. ✅ รัน `npm` / `composer` / `php` **ผ่าน `sail` เสมอ** (`sail npm ...`, `sail composer ...`)
6. ✅ **ห้ามใช้ `sudo` กับ sail/npm/composer** (ไฟล์จะกลายเป็นของ root)
7. ✅ PR ละ 1 งาน เล็กๆ และ merge ภายใน 1–2 วัน จะได้ conflict น้อย
8. ✅ ข้อมูลตัวอย่างใส่ใน **Seeder** — ทุกคนจะได้ข้อมูลเหมือนกันด้วย `sail artisan migrate:fresh --seed`

---

## 6. คำสั่งที่ใช้บ่อย

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `sail up -d` / `sail stop` | เปิด / ปิด container |
| `sail ps` | ดูสถานะ container |
| `sail npm run dev` | เปิดค้างไว้ตอนเขียนหน้าเว็บ |
| `sail artisan migrate` | สร้างตารางใหม่ที่เพิ่มมา |
| `sail artisan migrate:fresh --seed` | ⚠️ ล้าง DB ทั้งหมด แล้วใส่ข้อมูลตัวอย่างใหม่ |
| `sail artisan make:model Product -mcrs` | สร้าง Model + Migration + Controller + Seeder |
| `sail artisan tinker` | ทดลองรันโค้ด/query |
| `sail artisan route:list` | ดู URL ทั้งหมด |
| `git status` | ดูว่าแก้ไฟล์อะไรไปบ้าง |
| `git log --oneline` | ดูประวัติ commit |
| `git branch` | ดูว่าอยู่ branch ไหน |

---

## 7. แก้ปัญหาที่เจอบ่อย

| อาการ | วิธีแก้ |
|---|---|
| พิมพ์ `wsl` แล้ว prompt เป็น `docker-desktop:~#` | ทำข้อ 1.3 |
| `port is already allocated` (80 หรือ 3306) | ปิด XAMPP/MySQL บน Windows หรือ `docker ps` ดูว่าโปรเจกต์อื่นเปิดค้าง แล้ว `docker stop <ชื่อ>` หรือใส่ `APP_PORT=8080` ใน `.env` |
| `Connection refused` ตอน migrate | MySQL ยังไม่พร้อม รอแล้ว `sail ps` ดูให้ขึ้น `healthy` |
| `Permission denied` / `not writable` | `sudo chown -R $(id -u):$(id -g) .` |
| `Cannot find native binding` ตอน npm | `rm -rf node_modules` แล้ว `sail npm install` |
| หน้าเว็บไม่มี CSS / `Vite manifest not found` | `sail npm run dev` หรือ `sail npm run build` |
| Login ไม่ได้ทั้งที่สมัครแล้ว | อาจเพิ่ง `migrate:fresh` (ข้อมูลหาย) → สมัครใหม่ |
| ติดหน้า *verify email* | ดูหัวข้อ "ยืนยันอีเมลตอนทดสอบ" ในข้อ 2 |
| `git push` ขึ้น `rejected` | `git pull` ก่อน แล้วค่อย push |
| เผลอแก้โค้ดบน `main` (ยังไม่ commit) | `git checkout -b feature/ชื่องาน` — งานที่แก้จะย้ายไป branch ใหม่ให้ |

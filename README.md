# 🏔️ Tawang Memories

A personal travel photo website for your 5-day Tawang trip.
Browse locations, view photos by person, and manage everything via admin panel.

---

## 🗂️ Project Structure

```
tawang-memories/
├── frontend/     → Vite + React + Material UI
└── backend/      → Node.js + Express + MongoDB + DevLoad
```

---

## ⚙️ Prerequisites

- Node.js v20+
- MongoDB (local or Atlas)
- DevLoad account → https://devload.cloudcoderhub.in

---

## 🚀 Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tawang-memories
DEVLOAD_API_KEY=your-devload-api-key
DEVLOAD_PROJECT_ID=your-devload-project-id
ADMIN_PASSWORD=your-secret-password
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## 🌐 URL Structure

| URL | Description |
|-----|-------------|
| `/` | Home — all places listed by day |
| `/place/:slug` | Place page — persons + group |
| `/place/:slug/person/:id` | Person's photos at that place |
| `/place/:slug/group` | Group photos at that place |
| `/admin` | Admin panel (password protected) |

---

## 🔧 Admin Panel

Go to `/admin` → enter your `ADMIN_PASSWORD`.

### Steps to get started:

1. **Seed Data** → Click "Seed Tawang Data" to auto-create all 9 locations
2. **Add Persons** → Go to "Manage Persons", add all 5 travelers with names & avatars
3. **Upload Photos** → Go to "Upload Photos", select place + person (or Group), upload

---

## 📸 Photo URL Structure (Example)

```
/place/tawang-monastery           → shows 5 persons + Group card
/place/tawang-monastery/person/ID → masonry gallery for that person
/place/tawang-monastery/group     → group photos gallery
```

---

## 🏞️ Locations (Pre-seeded)

| Slug | Name | Day |
|------|------|-----|
| `dirang` | Dirang Valley | 1 |
| `sela-pass` | Sela Pass | 2 |
| `jaswant-garh` | Jaswant Garh War Memorial | 2 |
| `nuranang-falls` | Nuranang Waterfall | 2 |
| `tawang-monastery` | Tawang Monastery | 3 |
| `madhuri-lake` | Madhuri Lake | 3 |
| `pt-tso` | PT Tso Lake | 3 |
| `bum-la-pass` | Bum La Pass | 3 |
| `sangti-valley` | Sangti Valley | 4 |

---

## 🔑 DevLoad Setup

1. Sign up at https://devload.cloudcoderhub.in
2. Create a project → copy the **Project ID**
3. Go to API Keys → create one → copy the **API Key**
4. Add both to your `.env`

---

## 🛠️ Tech Stack

**Frontend**
- Vite + React 19
- Material UI v7
- Framer Motion
- React Router v7
- Axios

**Backend**
- Node.js (ESM)
- Express 4
- MongoDB + Mongoose
- Multer (temp file handling)
- DevLoad (cloud image storage)

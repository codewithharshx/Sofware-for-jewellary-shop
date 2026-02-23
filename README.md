# 💎 Satarkar Jewellers Billing Software

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

A professional **billing, inventory, and pawn management system** designed for **Satarkar Jewellers**.
The application streamlines invoice generation, pawn loan calculations, and automated record storage using Excel files.

---

## 📸 Application Preview

![Application Preview](app_mockup_1771840370277.png)

---

## ✨ Features

* 🧾 **Smart Billing** — Generate professional invoices for Gold, Silver, and Jewelry with automatic GST calculation
* 💰 **Pawn Calculator** — Calculate loan amount, interest, and total payable values for pawned items
* 📊 **Excel Integration** — Automatically saves billing and pawn records into monthly Excel files
* 🌍 **Multi-language Support** — Supports Marathi and English interface
* 🖨️ **Easy Printing** — One-click invoice printing directly from browser
* 📱 **Responsive UI** — Works smoothly across desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Frontend

* React.js 19
* Vite
* Tailwind CSS 4
* Lucide React

### Backend

* Node.js
* Express.js

### Storage

* Excel file-based storage using **xlsx library**

---

## 🎯 Problem Statement

Small jewellery businesses often rely on manual billing and paper registers which can lead to:

* Calculation errors in complex GST and interest calculations
* Poor long-term record management and tracking
* Tedious monthly accounting and reporting
* Risk of physical record damage or data loss

This software digitizes billing, automates calculations, and provides structured digital record keeping specifically for jewellery shop operations.

---

## 🚀 Getting Started

### ✅ Prerequisites

* Node.js (v16 or above)
* npm

---

### ⚙️ Installation

```bash
# Navigate into project
cd "Sofware for jewellary shop"

# Install dependencies for root, backend, and frontend
npm run install:all
```

---

### ▶️ Run Application

To run both backend and frontend together:

```bash
# Start backend server
npm run start:backend

# Start frontend
npm run start:frontend
```

Open in browser:
`http://localhost:5173`

---

## 📂 Project Structure

```
satarkar-jewellers/
│
├── frontend/        # React + Vite frontend
├── backend/         # Node + Express backend
│   └── data/        # Generated billing & pawn Excel files
├── Satarker Jewellers.groovy # Original design reference
└── README.md
```

---

## 💡 Key Learnings

* Implementing complex business logic for GST and interest calculations
* Designing a local persistence layer using Excel for simplicity and ease of access for non-technical users
* Developing a bilingual UI (Marathi/English) using React state management
* Creating print-ready CSS layouts for professional invoices
* modeling real-world business workflows into a digital solution

---

## 🌱 Future Enhancements

* 🔐 User Authentication & secure login
* ☁️ Cloud database integration for remote access
* 📊 Advanced sales analytics and visual dashboards
* 📦 Automated inventory and stock management
* 💳 Digital payment gateway integration
* 📲 PWA support for offline mobile usage

---

## 🤝 Contribution

Currently maintained by the author. Suggestions and improvements are welcome.

---

## 👨‍� Author

**Harshwardhan Sathe**
AI & Data Science Student

GitHub: [codewithharshx](https://github.com/codewithharshx)

---

⭐ If you found this useful, consider giving it a star!

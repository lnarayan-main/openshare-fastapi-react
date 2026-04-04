# Full-Stack FastAPI & React CRUD Application

A modern, full-stack blog management system featuring a **FastAPI** backend and a **React (Vite)** frontend. This application supports user authentication, profile management, and a complete CRUD (Create, Read, Update, Delete) flow for blog posts.

## 🚀 Features

- **Authentication:** JWT-based login and registration.
- **Profile Management:** Update user details and upload profile pictures.
- **Post Management:** Create, edit, and delete posts with image thumbnails.
- **Responsive UI:** Built with Tailwind CSS for a seamless experience on all devices.
- **Image Optimization:** Backend processing for uploaded images using Pillow.

---

## 🛠️ Tech Stack

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) - High-performance Python framework.
- [SQLAlchemy](https://www.sqlalchemy.org/) - SQL Toolkit and ORM.
- [SQLite](https://www.sqlite.org/) - Default database for development.
- [Pydantic](https://docs.pydantic.dev/) - Data validation and settings management.

**Frontend:**
- [React](https://reactjs.org/) with [Vite](https://vitejs.dev/) - Fast frontend tooling.
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
- [React Hook Form](https://react-hook-form.com/) - Performant form validation.
- [Axios](https://axios-http.com/) - Promise-based HTTP client.

---

## 📂 Project Structure

```text
CRUD_App/
├── backend/           # FastAPI source code
│   ├── app/           # Core logic (models, schemas, routers)
│   ├── uploads/       # Local storage for images (gitignored)
│   └── main.py        # Entry point
└── frontend/          # React source code
    ├── src/           # Components and logic
    └── public/        # Static assets
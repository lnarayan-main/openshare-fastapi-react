import axios from "axios";

const API_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => {
    const params = new URLSearchParams();
    params.append("username", credentials.email);
    params.append("password", credentials.password);
    return api.post("/auth/login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  register: (data) => api.post("/auth/register", data),

  getMe: () => api.get("/auth/me"),

  logout: () => api.post("/auth/logout"),
};

export const usersAPI = {
  getAll: () => api.get("/users/"),

  getById: (id) => api.get(`/users/${id}`),

  updateProfile: (data) => api.put("/users/profile", data),

  uploadProfilePic: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/users/profile-pic", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteProfilePic: () => api.delete("/users/profile-pic"),
};

export const postsAPI = {
    create: (data) => api.post(`/posts/create-post`, data),
    getPosts: () => api.get(`/posts/get-posts`),
    getAllPosts: () => api.get('/posts/all-posts'),
    getPostById: (id) => api.get(`/posts/post-by-id/${id}`)
};

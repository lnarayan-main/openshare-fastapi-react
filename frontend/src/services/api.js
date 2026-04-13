import axios from "axios";

// const API_URL = "http://localhost:8000/api";
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const API_URL = BASE_API_URL + "/api";

const api = axios.create({
  baseURL: API_URL,
  // headers: {
  //   "Content-Type": "application/json",
  // },
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

  forgotPassword: (data) => api.post("/auth/forgot-password", {email: data}),

  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),

  getMe: () => api.get("/auth/me"),

  logout: () => api.post("/auth/logout"),
};

export const usersAPI = {
  getAll: () => api.get("/users/"),

  getById: (id) => api.get(`/users/${id}`),

  updateProfile: (data) => api.put("/users/profile", data),

  uploadProfilePic: (file) => {
    const formData = new FormData();
    formData.append("profile_pic", file);
    return api.post("/users/profile-pic", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteProfilePic: () => api.delete("/users/profile-pic"),
};

export const postsAPI = {
    createPost: (data) => api.post(`/posts/create-post`, data),
    updatePost: (id, data) => api.put(`/posts/update-post/${id}`, data),
    getPosts: (params) => api.get(`/posts/get-posts`, {params}),
    getAllPosts: () => api.get('/posts/all-posts'),
    getPostById: (id) => api.get(`/posts/post-by-id/${id}`),
    deletePost: (id) => api.delete(`/posts/delete-post/${id}`),
};

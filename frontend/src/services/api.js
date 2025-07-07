import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach token if present
api.interceptors.request.use((config) => {
  let token = localStorage.getItem("token");

  if (token) {
    token = token.trim(); // Remove whitespace or accidental line breaks
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

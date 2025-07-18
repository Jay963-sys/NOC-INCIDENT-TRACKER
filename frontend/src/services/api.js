import axios from "axios";

const dev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const api = axios.create({
  baseURL: dev ? "http://localhost:5000/api" : "http://192.168.1.14:5000/api",
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

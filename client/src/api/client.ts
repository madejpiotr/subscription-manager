import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Automatycznie dołącza token do każdego requestu, jeśli jest zapisany
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
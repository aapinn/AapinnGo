import axios from "axios";

const api = axios.create({
  // Tambahkan /api di ujungnya agar tidak perlu tulis berulang kali
  baseURL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://localhost:5000",
})

// Tambahkan token ke setiap request otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tangani jika token expired (Error 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Hanya tendang jika memang error-nya 401 dan bukan saat mencoba login
    const isLoginRequest = error.config.url.includes("/login");
    
    if (error.response?.status === 401 && !isLoginRequest) {
      console.warn("Sesi habis atau tidak sah, mengalihkan...");
      localStorage.removeItem("token");
      
      // Gunakan replace agar user tidak bisa klik "back" ke halaman admin
      if (typeof window !== "undefined") {
        window.location.replace("/login"); 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
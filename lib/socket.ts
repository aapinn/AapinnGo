import { io } from "socket.io-client";

// Ambil URL dari environment variable Vercel
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // Memaksa pakai websocket agar lebih cepat di Railway
  withCredentials: true,
});

export default socket;
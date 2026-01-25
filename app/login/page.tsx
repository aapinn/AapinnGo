"use client";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (token: string, activeRoomId: string | null) => {
    // 1. Simpan token ke localStorage
    localStorage.setItem("token", token);

    // 2. Jika ada roomId, simpan juga
    if (activeRoomId) {
      localStorage.setItem("activeRoomId", activeRoomId); // Sesuaikan key dengan ProductPage (activeRoomId)
      router.push(`/room/${activeRoomId}/order`);
    } else {
      router.push("/");
    }
    
    // Opsional: Beri toast sukses
    // toast.success("Selamat datang!");
  };

const login = async () => {
    if (!username || !password) return alert("Isi username dan password");
    try {
      setLoading(true);
      // GANTI localhost menjadi process.env
      const res = await api.post(`/auth/login`, { 
        username, 
        password 
      });

      const { token, activeRoomId } = res.data;
      handleLoginSuccess(token, activeRoomId);

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await api.post(`/auth/google-login`, { 
        idToken 
      });

      const { token, activeRoomId } = res.data;
      handleLoginSuccess(token, activeRoomId);

    } catch (err: any) {
      console.error(err);
      alert("Login Google gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold">
          Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-3 w-full rounded-lg border px-4 py-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border px-4 py-2"
        />

        <button
          onClick={login}
          disabled={loading}
          className="mb-4 w-full rounded-lg bg-black py-2 text-white disabled:opacity-60"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <div className="my-4 text-center text-sm text-gray-500">
          atau
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 hover:bg-gray-100 disabled:opacity-60"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5"
          />
          <span>Login dengan Google</span>
        </button>
      </div>
    </div>
  );
}

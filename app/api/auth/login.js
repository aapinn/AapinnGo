import axios from "axios";

export async function loginUser(email, password) {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    
    const token = res.data.token; // asumsi backend mengirim { token: "..." }
    
    // simpan token di localStorage
    localStorage.setItem("token", token);
    
    console.log("Login berhasil, token:", token);
    return token;
  } catch (err) {
    console.error("Login gagal:", err.response?.data || err.message);
  }
}

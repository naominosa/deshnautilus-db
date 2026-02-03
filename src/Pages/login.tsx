import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ================= EMAIL LOGIN =================
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Google login failed");
    }
  };

  return (
    <div style={container}>
      <h1>Login</h1>

      {/* Email Login Form */}
      <form onSubmit={handleEmailLogin} style={formStyle}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" style={emailBtn}>
          Login
        </button>
      </form>

      <p>OR</p>

      {/* Google Login */}
      <button onClick={handleGoogleLogin} style={googleBtn}>
        Sign in with Google
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

// ================= STYLES =================
const container = {
  textAlign: "center" as const,
  padding: "60px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column" as const,
  width: "250px",
  margin: "0 auto",
  gap: "10px",
};

const inputStyle = {
  padding: "10px",
  fontSize: "16px",
};

const emailBtn = {
  padding: "10px",
  backgroundColor: "#333",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const googleBtn = {
  padding: "10px 20px",
  backgroundColor: "#4285F4",
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};

export default Login;

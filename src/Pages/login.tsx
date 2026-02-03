import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("User Info:", result.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome</h1>
      <button onClick={handleLogin} style={btnStyle}>
        Sign in with Google
      </button>
    </div>
  );
};

const btnStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  cursor: "pointer",
  backgroundColor: "#4285F4",
  color: "white",
  border: "none",
  borderRadius: "5px"
};

export default Login;
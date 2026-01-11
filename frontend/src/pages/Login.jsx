import { useState } from "react";
import api from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("admin"); // 'admin' or 'user'

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      window.location.reload();
    } catch (error) {
      alert("Login failed: " + error.response?.data?.message || "Invalid credentials");
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-card">
        <h2>{loginType === 'admin' ? 'Admin Login' : 'User Login'}</h2>
        <div className="login-type-selector">
          <button 
            type="button" 
            className={loginType === 'admin' ? 'active' : ''}
            onClick={() => setLoginType('admin')}
          >
            Admin
          </button>
          <button 
            type="button" 
            className={loginType === 'user' ? 'active' : ''}
            onClick={() => setLoginType('user')}
          >
            User
          </button>
        </div>
        <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;

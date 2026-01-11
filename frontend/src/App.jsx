import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return token ? <Dashboard role={role} /> : <Login />;
}

export default App;

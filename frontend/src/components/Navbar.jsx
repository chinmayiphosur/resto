function Navbar({ role }) {
  return (
    <div className="navbar">
      <div>
        <h1>Inventory Management</h1>
        <span className="user-role">{role === 'admin' ? 'Admin' : 'User'} Access</span>
      </div>
      <button onClick={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.reload();
      }}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;

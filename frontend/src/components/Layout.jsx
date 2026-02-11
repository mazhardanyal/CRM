import { useState } from "react";
import { FiUsers, FiClipboard, FiBarChart2, FiLogOut, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function Layout({ children, active }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <div className={`bg-white border-r shadow-sm ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300`}>
        <div className="flex items-center justify-between p-6 border-b">
          <span className={`font-bold text-xl ${!sidebarOpen && "hidden"}`}>MyCRM</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded transition">
            <FiMenu />
          </button>
        </div>
        <nav className="mt-8">
          <ul>
            {[
              { name: "Dashboard", icon: <FiBarChart2 />, route: "/dashboard" },
              { name: "Leads", icon: <FiClipboard />, route: "/leads" },
              { name: "Users", icon: <FiUsers />, route: "/users" },
            ].map((item) => (
              <li
                key={item.name}
                onClick={() => navigate(item.route)}
                className={`flex items-center gap-4 px-6 py-3 mb-2 cursor-pointer rounded hover:bg-gray-100 transition ${
                  active === item.name ? "bg-gray-100 font-medium" : ""
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`${!sidebarOpen && "hidden"}`}>{item.name}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">{active}</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            <FiLogOut /> Logout
          </button>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}

export default Layout;
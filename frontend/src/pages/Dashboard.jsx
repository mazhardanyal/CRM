import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiClipboard, FiBarChart2, FiLogOut, FiMenu } from "react-icons/fi";

function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);  
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    status: "",
    assignedTo: "", // for assigning task
  });

  const user = JSON.parse(sessionStorage.getItem("user"));

  // ================= FETCH LEADS =================
  const fetchLeads = async (name = "") => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

   try {
  const url = name.trim()
    ? `${import.meta.env.VITE_API_URL}/api/leads/search?name=${name}`
    : `${import.meta.env.VITE_API_URL}/api/leads`;

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

      setLeads(res.data);
    } catch (err) {
      console.error("Failed to fetch leads:", err.response?.data?.message || err.message);
    }
  };

  // ================= FETCH NOTIFICATIONS =================
  const fetchNotifications = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

  try {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
      console.log("All notifications:", res.data);

      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err.message);
      setNotifications([]);
    }
  };

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

   try {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      console.error(err.message);
      setUsers([]);
    }
  };

  // ================= SEARCH LEADS WITH DEBOUNCE =================
  useEffect(() => {
    if (!user) return;

    const delay = setTimeout(() => {
      if (search.trim() === "") {
        fetchLeads();        // fetch all leads
      } else {
        fetchLeads(search);  // fetch filtered leads
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [search, user]);

  // ================= INITIAL LOAD =================
  useEffect(() => {
    if (!user) return;

    fetchLeads(); // only call once on page load
    if (user?.role === "admin" || user?.role === "manager") fetchUsers();
    if (user.role !== "admin") fetchNotifications();

    const interval = user.role !== "admin" ? setInterval(fetchNotifications, 10000) : null;
    return () => interval && clearInterval(interval);
  }, [user]);

  // ================= LOGOUT =================
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  // ================= DELETE LEAD =================
  const handleDelete = async (id) => {
    const token = sessionStorage.getItem("token");
    if (!window.confirm("Delete this lead?")) return;
   try {
  await axios.delete(`${import.meta.env.VITE_API_URL}/api/leads/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
      fetchLeads(search);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // ================= EDIT LEAD =================
  const handleEdit = (lead) => {
    setEditingLead(lead._id);
    setFormData({
      name: lead.name,
      company: lead.company,
      status: lead.status,
      assignedTo: lead.assignedTo?._id || "",
    });
  };

  const handleCancel = () => {
    setEditingLead(null);
  };

  // ================= UPDATE LEAD =================
  // ================= UPDATE LEAD =================
const handleUpdate = async () => {
  const token = sessionStorage.getItem("token");

  if (!editingLead) return;

  try {
    // Prepare payload
    const payload = {
      name: formData.name,
      company: formData.company,
      status: formData.status,
      assignedTo: formData.assignedTo || null, // send null if unassigned
    };

    // Send PUT request to backend
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/leads/${editingLead}`, payload, {
  headers: { Authorization: `Bearer ${token}` },
});

    console.log("Updated lead:", res.data);

    // Refresh leads
    fetchLeads(search);

    // Clear editing state
    setEditingLead(null);
    setFormData({ name: "", company: "", status: "", assignedTo: "" });

  } catch (err) {
    console.error("Failed to update lead:", err.response?.data?.message || err.message);
    alert(err.response?.data?.message || "Update failed");
  }
};

  // ================= MARK NOTIFICATION AS READ =================
  const markRead = async (notifId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

   try {
  await axios.put(
    `${import.meta.env.VITE_API_URL}/api/notifications/${notifId}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification read:", err.message);
    }
  };  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <div
        className={`bg-white border-r shadow-sm ${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <span className={`font-bold text-xl ${!sidebarOpen && "hidden"}`}>
            TechMesh
          </span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <FiMenu />
          </button>
        </div>
        <nav className="mt-8">
          <ul>
            {[
              { name: "Dashboard", icon: <FiBarChart2 /> },
              { name: "Leads", icon: <FiClipboard /> },
              { name: "Users", icon: <FiUsers /> },
            ].map((item) => (
              <li
                key={item.name}
                className={`flex items-center gap-4 px-6 py-3 mb-2 cursor-pointer rounded hover:bg-gray-100 transition ${
                  item.name === "Dashboard" ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => {
                  if (item.name === "Leads") navigate("/leads");
                  else if (item.name === "Dashboard") navigate("/dashboard");
                  else if (item.name === "Users") navigate("/users");
                }}
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
          <h1 className="text-3xl font-semibold">Welcome, {user?.name || "User"}</h1>
          <div className="flex items-center gap-4">
            {/* Notifications for employees only */}
            {/* Notifications for non-admin users */}
{user?.role !== "admin" && (
  <div className="relative">
    <button
      onClick={() => setNotifOpen(!notifOpen)}
      className="relative group"
    >
      <div className="w-10 border border-red-500 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition duration-300">
        <span className="text-lg ">🔔</span>
      </div>

      {notifications.some((n) => !n.read) && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
      )}
    </button>

    {notifOpen && (
      <>
        {/* Background blur overlay */}
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          onClick={() => setNotifOpen(false)}
        />

        {/* Floating Glass Panel */}
        <div className="absolute right-0 mt-4 w-[420px] max-h-[500px] z-50 
                        bg-white/70 backdrop-blur-xl 
                        border border-white/40 
                        rounded-3xl shadow-2xl 
                        overflow-hidden 
                        animate-notifScale">

          {/* Header */}
          <div className="px-6 py-5 border-b border-white/40 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Notifications
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {notifications.length} total
              </p>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[420px] overflow-y-auto custom-scroll">

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="text-5xl mb-4 opacity-50">🔕</div>
                <p className="text-sm">You're all caught up</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.read;

                return (
                  <div
                    key={n._id}
                    onClick={() => isUnread && markRead(n._id)}
                    className={`px-6 py-5 transition-all duration-300 cursor-pointer
                      ${isUnread
                        ? "bg-white/80 hover:bg-white"
                        : "hover:bg-white/60"}
                    `}
                  >
                    <div className="flex gap-4">

                      {/* Left Indicator */}
                      <div className="flex flex-col items-center pt-1">
                        {isUnread && (
                          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed 
                          ${isUnread
                            ? "text-gray-900 font-medium"
                            : "text-gray-600"}
                        `}>
                          {n.message}
                        </p>

                        {n.lead && (
                          <div className="mt-2 text-xs text-gray-500">
                            {n.lead.name} • {n.lead.status}
                          </div>
                        )}

                        <div className="mt-3 text-[11px] text-gray-400 tracking-wide uppercase">
                          {new Date(n.timestamp).toLocaleString()}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>
      </>
    )}
  </div>
)}           {/* Profile Dropdown */}
<div className="relative ">
  <button
    onClick={() => setProfileOpen(!profileOpen)}
    className="w-10 h-10 flex border border-red-500 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition duration-300"
  >
    <span className="text-lg">{user?.name?.charAt(0)}</span>
  </button>

  {profileOpen && (
    <div className="absolute border border-red-500 right-0 border-red-500 mt-2 w-56 bg-white rounded-xl shadow-xl z-50  overflow-hidden">
      <div className="px-4 py-3  ">
        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
        <p className="text-xs  text-gray-500">Role: {user?.role}</p>
      </div>
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-sm text-red-600  hover:bg-red-50"
      >
        Logout
      </button>
    </div>
  )}
</div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow hover:shadow-md transition flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-500 uppercase font-medium">Total Leads</h2>
              <p className="text-2xl font-bold mt-1">{leads.length}</p>
            </div>
            <FiClipboard className="text-3xl text-blue-500" />
          </div>

          <div className="bg-white p-6 rounded shadow hover:shadow-md transition flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-500 uppercase font-medium">New Leads</h2>
              <p className="text-2xl font-bold mt-1">
                {leads.filter((lead) => lead.status === "New").length}
              </p>
            </div>
            <FiClipboard className="text-3xl text-green-500" />
          </div>

          <div className="bg-white p-6 rounded shadow hover:shadow-md transition flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-500 uppercase font-medium">Pending Follow-ups</h2>
              <p className="text-2xl font-bold mt-1">
                {leads.filter(
                  (lead) =>
                    lead.followUpDate && new Date(lead.followUpDate) >= new Date()
                ).length}
              </p>
            </div>
            <FiClipboard className="text-3xl text-yellow-500" />
          </div>

          <div className="bg-white p-6 rounded shadow hover:shadow-md transition flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-500 uppercase font-medium">Won Leads</h2>
              <p className="text-2xl font-bold mt-1">
                {leads.filter((lead) => lead.status === "Won").length}
              </p>
            </div>
            <FiBarChart2 className="text-3xl text-green-600" />
          </div>

          <div className="bg-white p-6 rounded shadow hover:shadow-md transition flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-500 uppercase font-medium">Lost Leads</h2>
              <p className="text-2xl font-bold mt-1">
                {leads.filter((lead) => lead.status === "Lost").length}
              </p>
            </div>
            <FiBarChart2 className="text-3xl text-red-600" />
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 flex justify-between">
         <input
  type="text"
  placeholder="Search by name..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="border px-3 py-2 rounded"
/>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {["Name", "Company", "Status", "Assigned To", "Actions"].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
             {leads.map((lead) => (
  <tr key={lead._id} className="hover:bg-gray-50 transition">
    <td className="px-6 py-4">
      {editingLead === lead._id ? (
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border px-2 py-1 rounded"
        />
      ) : (
        lead.name
      )}
    </td>
    <td className="px-6 py-4">
      {editingLead === lead._id ? (
        <input
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="border px-2 py-1 rounded"
        />
      ) : (
        lead.company
      )}
    </td>
    <td className="px-6 py-4">
      {editingLead === lead._id ? (
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="border px-2 py-1 rounded"
        >
          <option>New</option>
          <option>Contacted</option>
          <option>Demo Scheduled</option>
          <option>Negotiation</option>
          <option>Won</option>
          <option>Lost</option>
        </select>
      ) : (
        lead.status
      )}
    </td>
    <td className="px-6 py-4">
      {editingLead === lead._id ? (
        <select
          value={formData.assignedTo}
          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
          className="border px-2 py-1 rounded"
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
      ) : (
        lead.assignedTo?.name || "Unassigned"
      )}
    </td>
    <td className="px-6 py-4 flex gap-2">
      {editingLead === lead._id ? (
        <>
          <button
            onClick={handleUpdate}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          {(user?.role === "admin" || user?.role === "manager") && (
            <button
              onClick={() => handleEdit(lead)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
          )}
          {user?.role === "admin" && (
            <button
              onClick={() => handleDelete(lead._id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          )}
        </>
      )}
    </td>
  </tr>
))}            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          © 2026 TechMesh. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiClipboard, FiBarChart2, FiLogOut, FiMenu } from "react-icons/fi";

function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState([]);
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

  // Fetch leads
  const fetchLeads = async (name = "") => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/leads/search?name=${name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeads(res.data);
    } catch (err) {
      console.error("Failed to fetch leads:", err.response?.data?.message || err.message);
    }
  };

  // Fetch notifications
const fetchNotifications = async () => {
  const token = sessionStorage.getItem("token");
  if (!token || !user) return;

  try {
    const res = await axios.get("http://localhost:5000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("All notifications:", res.data); // debug

    const userNotifs = res.data.filter(
      (n) => n.user.toString() === user._id.toString()
    );

    setNotifications(userNotifs);
  } catch (err) {
    console.error("Failed to fetch notifications:", err.message);
    setNotifications([]);
  }
};
 // Fetch users (move this up)
const fetchUsers = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) return;

  try {
    const res = await axios.get("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Ensure users is always an array
    setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
  } catch (err) {
    console.error(err.message);
    setUsers([]); // fallback
  }
};
useEffect(() => {
  if (!user) return;

  fetchLeads();
  if (user.role === "admin") fetchUsers(); // only admin can fetch users
  if (user.role !== "admin") fetchNotifications();

  const interval =
    user.role !== "admin" ? setInterval(fetchNotifications, 10000) : null;

  return () => interval && clearInterval(interval);
}, [user]);
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const handleDelete = async (id) => {
    const token = sessionStorage.getItem("token");
    if (!window.confirm("Delete this lead?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeads(search);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

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

const handleUpdate = async () => {
  const token = sessionStorage.getItem("token");

  try {
    // Update the lead first
    await axios.put(
      `http://localhost:5000/api/leads/${editingLead}`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Admin assigns lead -> create notification for employee
    // Inside handleUpdate, after updating the lead
if (user.role === "admin" && formData.assignedTo) {
  await axios.post(
    "http://localhost:5000/api/notifications",
    {
      user: formData.assignedTo, // <-- use 'user' here
      message: `You have been assigned a lead: ${formData.name}`,
      leadId: editingLead,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
    // Reset editing state and refresh data
    setEditingLead(null);
    fetchLeads(search);

    // If the logged-in user is the assigned employee OR not admin, fetch notifications
    if (user.role !== "admin") {
      fetchNotifications();
    }
  } catch (err) {
    alert(err.response?.data?.message || "Update failed");
  }
};
// Mark notification as read
const markRead = async (notifId) => {
  const token = sessionStorage.getItem("token");
  if (!token) return;

  try {
    await axios.put(
      `http://localhost:5000/api/notifications/${notifId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchNotifications();
  } catch (err) {
    console.error("Failed to mark notification read:", err.message);
  }
};
  return (
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
      className="relative p-2 rounded hover:bg-gray-100 transition"
    >
      🔔
      {notifications.filter((n) => !n.read).length > 0 && (
        <span className="absolute top-0 right-0 px-2 py-1 text-xs text-white bg-red-600 rounded-full">
          {notifications.filter((n) => !n.read).length}
        </span>
      )}
    </button>

    {notifOpen && (
      <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded shadow-lg z-50">
        {notifications.length === 0 ? (
          <p className="p-2 text-gray-500">No notifications</p>
        ) : (
          notifications.map((n) => {
            // Ensure n.user exists before using
            const isUnread = !n.read;
            return (
              <div
                key={n._id}
                className={`p-2 border-b cursor-pointer hover:bg-gray-100 ${
                  isUnread ? "bg-white" : "bg-gray-50"
                }`}
                onClick={() => isUnread && markRead(n._id)}
              >
                <p className="text-sm">{n.message}</p>
                {n.lead && (
                  <p className="text-xs text-gray-400">
                    Lead: {n.lead.name || "N/A"}, Status: {n.lead.status || "N/A"}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {n.timestamp ? new Date(n.timestamp).toLocaleString() : ""}
                </p>
              </div>
            );
          })
        )}
      </div>
    )}
  </div>
)}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              <FiLogOut /> Logout
            </button>
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
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchLeads(e.target.value);
            }}
            className="border px-4 py-2 rounded w-64"
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
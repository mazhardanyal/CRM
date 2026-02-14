import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiClipboard, FiBarChart2, FiLogOut, FiMenu } from "react-icons/fi";

function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState([]);
const [search, setSearch] = useState("");
const user = JSON.parse(sessionStorage.getItem("user"));
  // Fetch leads from backend
 const fetchLeads = async (name = "") => {
  const token = sessionStorage.getItem("token");
  if (!token) return;

  try {
    const res = await axios.get(
      `http://localhost:5000/api/leads/search?name=${name}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setLeads(res.data);
  } catch (err) {
    console.error(
      "Failed to fetch leads:",
      err.response?.data?.message || err.message
    );
  }
};

useEffect(() => {
  fetchLeads();
}, []);

const [editingLead, setEditingLead] = useState(null);
const [formData, setFormData] = useState({
  name: "",
  company: "",
  status: "",
});



  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };



const handleDelete = async (id) => {
  const token = sessionStorage.getItem("token");

  if (!window.confirm("Delete this lead?")) return;

  try {
    await axios.delete(
      `http://localhost:5000/api/leads/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchLeads(search); // refresh after delete
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
  });
};
const handleUpdate = async () => {
  const token = sessionStorage.getItem("token");

  try {
    await axios.put(
      `http://localhost:5000/api/leads/${editingLead}`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setEditingLead(null);
    fetchLeads(search);
  } catch (err) {
    alert(err.response?.data?.message || "Update failed");
  }
};

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <div className={`bg-white border-r shadow-sm ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300`}>
        <div className="flex items-center justify-between p-6 border-b">
          <span className={`font-bold text-xl ${!sidebarOpen && "hidden"}`}>MyCRM</span>
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
  else if (item.name === "Users") navigate("/users"); // ✅ add this
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
          <h1 className="text-3xl font-semibold">Welcome, Admin</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            <FiLogOut /> Logout
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                {leads.filter(lead => lead.status === "New").length}
              </p>
            </div>
            <FiClipboard className="text-3xl text-green-500" />
          </div>

          <div className="bg-white p-6 rounded shadow hover:shadow-md transition flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-500 uppercase font-medium">Pending Follow-ups</h2>
              <p className="text-2xl font-bold mt-1">
                {leads.filter(lead => lead.followUpDate && new Date(lead.followUpDate) >= new Date()).length}
              </p>
            </div>
            <FiClipboard className="text-3xl text-yellow-500" />
          </div>
        </div>          


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
                {["Name", "Company", "Status", "Assigned To", "Actions"].map((col) => (                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">

  {/* NAME */}
  <td className="px-6 py-4">
    {editingLead === lead._id ? (
      <input
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
        className="border px-2 py-1 rounded"
      />
    ) : (
      lead.name
    )}
  </td>

  {/* COMPANY */}
  <td className="px-6 py-4">
    {editingLead === lead._id ? (
      <input
        value={formData.company}
        onChange={(e) =>
          setFormData({ ...formData, company: e.target.value })
        }
        className="border px-2 py-1 rounded"
      />
    ) : (
      lead.company
    )}
  </td>

  {/* STATUS */}
  <td className="px-6 py-4">
    {editingLead === lead._id ? (
      <select
        value={formData.status}
        onChange={(e) =>
          setFormData({ ...formData, status: e.target.value })
        }
        className="border px-2 py-1 rounded"
      >
        <option>New</option>
        <option>Contacted</option>
        <option>Won</option>
        <option>Lost</option>
      </select>
    ) : (
      lead.status
    )}
  </td>

  {/* ASSIGNED */}
  <td className="px-6 py-4">
    {lead.assignedTo?.name || "Unassigned"}
  </td>

  {/* ACTIONS */}
  <td className="px-6 py-4 flex gap-2">

    {editingLead === lead._id ? (
      <button
        onClick={handleUpdate}
        className="bg-green-500 text-white px-3 py-1 rounded"
      >
        Save
      </button>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          © 2026 MyCRM. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
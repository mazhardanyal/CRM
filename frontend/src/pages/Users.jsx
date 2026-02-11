import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { FiEdit, FiTrash2, FiUserX, FiUserCheck } from "react-icons/fi";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [creating, setCreating] = useState(false);

  const token = sessionStorage.getItem("token");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(
        "http://localhost:5000/api/users",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ name: "", email: "", password: "", role: "employee" });
      fetchUsers();
      alert("User created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setCreating(false);
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await axios.put(`http://localhost:5000/api/users/deactivate/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleReactivate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/users/reactivate/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <Layout active="Users">
      <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow space-y-8">

        {/* Add User Form */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Add New User</h2>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="border p-2 rounded"
              required
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Email"
              className="border p-2 rounded"
              required
            />
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="Password"
              className="border p-2 rounded"
              required
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
             
            </select>
            <button
              type="submit"
              disabled={creating}
              className="md:col-span-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {creating ? "Creating..." : "Add User"}
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Users List</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {["Name", "Email", "Role", "Status", "Actions"].map((col) => (
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
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4 capitalize">{user.role}</td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="text-green-600 font-medium">Active</span>
                        ) : (
                          <span className="text-red-600 font-medium">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeactivate(user._id)}
                            className="bg-yellow-200 p-1 rounded hover:bg-yellow-300"
                            title="Deactivate"
                          >
                            <FiUserX />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(user._id)}
                            className="bg-green-200 p-1 rounded hover:bg-green-300"
                            title="Reactivate"
                          >
                            <FiUserCheck />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="bg-red-200 p-1 rounded hover:bg-red-300"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Users;
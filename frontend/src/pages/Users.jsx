import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { FiEdit, FiTrash2, FiUserX, FiUserCheck } from "react-icons/fi";

function Users() {

  /* ===================== STATE ===================== */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  /* ===================== FETCH USERS ===================== */
  const fetchUsers = async () => {
    const token = sessionStorage.getItem("token");
    setLoading(true);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data.users);
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ===================== FORM CHANGE ===================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===================== CREATE USER ===================== */
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
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

  /* ===================== USER ACTIONS ===================== */
  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    const token = sessionStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:5000/api/users/deactivate/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleReactivate = async (id) => {
    const token = sessionStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:5000/api/users/reactivate/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const token = sessionStorage.getItem("token");

    try {
      await axios.delete(
        `http://localhost:5000/api/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  /* ===================== UPDATE USER ===================== */
  const handleUpdateUser = async () => {
    const token = sessionStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        {
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  /* ===================== RESET PASSWORD ===================== */
  const handleResetPassword = async () => {
    const token = sessionStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:5000/api/reset-password/${selectedUser._id}`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswordOpen(false);
      setNewPassword("");
      setSelectedUser(null);
      alert("Password reset successfully");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  /* ===================== UI ===================== */
  return (
    <Layout active="Users">
      <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow space-y-8">

        {/* Add User */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Add New User</h2>
          <form onSubmit={handleCreateUser} className="grid md:grid-cols-4 gap-4">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="border p-2 rounded" required />
            <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email" className="border p-2 rounded" required />
            <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" className="border p-2 rounded" required />
            <select name="role" value={form.role} onChange={handleChange} className="border p-2 rounded">
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
            <button type="submit" disabled={creating} className="bg-blue-600 text-white px-4 py-2 rounded">
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {["Name", "Email", "Role", "Status", "Actions"].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs uppercase">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 capitalize">{user.role}</td>
                    <td className="px-6 py-4">
                      {user.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {user.isActive ? (
                        <button onClick={() => handleDeactivate(user._id)} className="bg-yellow-200 p-1 rounded">
                          <FiUserX />
                        </button>
                      ) : (
                        <button onClick={() => handleReactivate(user._id)} className="bg-green-200 p-1 rounded">
                          <FiUserCheck />
                        </button>
                      )}

                      <button onClick={() => handleDelete(user._id)} className="bg-red-200 p-1 rounded">
                        <FiTrash2 />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser({ ...user });
                          setEditOpen(true);
                        }}
                        className="bg-blue-200 p-1 rounded"
                      >
                        <FiEdit />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser({ ...user });
                          setPasswordOpen(true);
                        }}
                        className="bg-purple-200 p-1 rounded"
                      >
                        🔐
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96 space-y-4">
            <h3 className="text-lg font-bold">Edit User</h3>

            <input value={selectedUser.name} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} className="border p-2 w-full rounded" />
            <input value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} className="border p-2 w-full rounded" />

            <select value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })} className="border p-2 w-full rounded">
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditOpen(false)} className="bg-gray-300 px-3 py-1 rounded">
                Cancel
              </button>
              <button onClick={handleUpdateUser} className="bg-blue-600 text-white px-3 py-1 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96 space-y-4">
            <h3 className="text-lg font-bold">
              Reset Password for {selectedUser.name}
            </h3>

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-2 w-full rounded"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setPasswordOpen(false)} className="bg-gray-300 px-3 py-1 rounded">
                Cancel
              </button>
              <button onClick={handleResetPassword} className="bg-purple-600 text-white px-3 py-1 rounded">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default Users;
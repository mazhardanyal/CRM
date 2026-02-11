import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddLead({ onLeadAdded }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "New",
    assignedTo: null, // ✅ must be null if unassigned
    notes: "",
    followUpDate: "",
  });

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data.users || []); // make sure to get the "users" array
      } catch (err) {
        console.error("Failed to fetch employees:", err.response?.data?.message || err.message);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ convert empty string to null for assignedTo
    setForm((prev) => ({
      ...prev,
      [name]: name === "assignedTo" && value === "" ? null : value,
    }));
  };

  // Submit lead
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/leads",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Lead created successfully!");

      // Update parent if callback exists
      if (onLeadAdded) onLeadAdded(res.data);

      // Navigate back to Leads page
      navigate("/leads");
    } catch (err) {
      console.error("Lead creation failed:", err.response?.data?.message || err.message);
      alert("Failed to create lead: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Layout active="Add Lead">
      <div className="max-w-lg bg-white p-8 rounded shadow mx-auto mt-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Add New Lead</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            className="input-field"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="input-field"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            className="input-field"
          />

          <input
            type="text"
            name="company"
            placeholder="Company"
            onChange={handleChange}
            className="input-field"
          />

          <select name="status" onChange={handleChange} className="input-field">
            {["New","Contacted","Demo Scheduled","Negotiation","Won","Lost"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select name="assignedTo" onChange={handleChange} className="input-field">
            <option value="">Unassigned</option>
            {loadingEmployees ? (
              <option disabled>Loading employees...</option>
            ) : (
              employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} {emp.role ? `(${emp.role})` : ""}
                </option>
              ))
            )}
          </select>

          <textarea
            name="notes"
            placeholder="Notes"
            onChange={handleChange}
            className="input-field"
          ></textarea>

          <input
            type="date"
            name="followUpDate"
            onChange={handleChange}
            className="input-field"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            Create Lead
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default AddLead;
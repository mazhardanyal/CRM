  import Layout from "../components/Layout";
  import { useState, useEffect } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";

  function Leads() {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);

    useEffect(() => {
      const fetchLeads = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        try {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leads/search`, {
    headers: { Authorization: `Bearer ${token}` },
  });
          setLeads(res.data);
        } catch (err) {
          console.error(err.response?.data?.message || err.message);
        }
      };
      fetchLeads();
    }, []);

    return (
      <Layout active="Leads">
        <div className="flex justify-between items-center mb-4">
  <h1 className="text-2xl font-bold">Leads List</h1>
  {["admin", "manager"].includes(JSON.parse(sessionStorage.getItem("user"))?.role) && (
    <button
      onClick={() => navigate("/add-lead")}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      + Add Lead
    </button>
  )}
</div>
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {["Name", "Company", "Status", "Assigned To", "Follow-Up"].map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
    {leads.map((lead, idx) => (
      <tr
        key={idx}
        className="hover:bg-gray-50 transition cursor-pointer"
        onClick={() => navigate(`/lead/${lead._id}`)}
      >
        <td className="px-6 py-4 whitespace-nowrap">{lead.name}</td>
        <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
        <td className="px-6 py-4 whitespace-nowrap">{lead.phone}</td>
        <td className="px-6 py-4 whitespace-nowrap">{lead.company}</td>
        <td className="px-6 py-4 whitespace-nowrap">{lead.status}</td>
        <td className="px-6 py-4 whitespace-nowrap">{lead.assignedTo?.name || "Unassigned"}</td>
        <td className="px-6 py-4 whitespace-nowrap">{lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : "-"}</td>
      </tr>
    ))}
  </tbody>
          </table>
        </div>
      </Layout>
    );
  }

  export default Leads;
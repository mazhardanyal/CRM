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
        const res = await axios.get("http://localhost:5000/api/leads/search", {
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
        <button
          onClick={() => navigate("/add-lead")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Lead
        </button>
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
              <tr key={idx} className="hover:bg-gray-50 transition cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">{lead.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lead.company}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-white ${
                    lead.status === "New" ? "bg-blue-500" :
                    lead.status === "Contacted" ? "bg-green-500" :
                    lead.status === "Demo Scheduled" ? "bg-yellow-500" :
                    lead.status === "Negotiation" ? "bg-indigo-500" :
                    lead.status === "Won" ? "bg-green-700" :
                    "bg-red-500"
                  }`}>
                    {lead.status}
                  </span>
                </td>
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
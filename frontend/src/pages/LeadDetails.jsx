import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function LeadDetails() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [note, setNote] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchLead = async () => {
    const token = sessionStorage.getItem("token");
    const res = await axios.get(`http://localhost:5000/api/leads/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLead(res.data);
  };

  const addNote = async () => {
    if (!note.trim()) return;
    const token = sessionStorage.getItem("token");
    await axios.post(
      `http://localhost:5000/api/leads/${id}/notes`,
      { text: note },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNote("");
    fetchLead();
  };

  useEffect(() => {
    fetchLead();
  }, []);

  if (!lead) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">{lead.name}</h1>

      {/* Contact Info + Basic Lead Info */}
      <div className="bg-white p-6 rounded shadow mb-6 space-y-2">
        <p><strong>Email:</strong> {lead.email}</p>
        <p><strong>Phone:</strong> {lead.phone}</p>
        <p><strong>Company:</strong> {lead.company}</p>
        <p><strong>Status:</strong> {lead.status}</p>
        <p><strong>Assigned To:</strong> {lead.assignedTo?.name || "Unassigned"}</p>
        <p>
          <strong>Follow-Up:</strong>{" "}
          {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : "-"}
        </p>
      </div>

      {/* Notes Section */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Notes</h2>

        {/* Only employees can add notes */}
       {["employee", "manager", "admin"].includes(user.role) && (
  <div className="mb-4">
    <textarea
      value={note}
      onChange={(e) => setNote(e.target.value)}
      className="border w-full p-2 rounded"
      placeholder="Add note..."
    />
    <button
      onClick={addNote}
      className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
    >
      Add Note
    </button>
  </div>
)}
        {lead.notes?.length === 0 && <p>No notes yet.</p>}

        {lead.notes?.map((n, index) => (
          <div key={index} className="border-b py-2">
            <p>{n.text}</p>
            <p className="text-xs text-gray-500">
              By: {n.addedBy?.name || "Unknown"} | {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default LeadDetails;
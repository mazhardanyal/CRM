import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AddLead from "./pages/AddLead";
import Leads from "./pages/Leads";
import Users from "./pages/Users";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
<Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />



<Route path="/users" element={<Users />} />
        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route path="/add-lead" element={<ProtectedRoute><AddLead /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
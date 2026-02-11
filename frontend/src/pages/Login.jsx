import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      const data = response.data;

      // Save token in sessionStorage
// Replace localStorage with sessionStorage
sessionStorage.setItem("token", data.token);
sessionStorage.setItem("user", JSON.stringify(data.user));      console.log("Login successful:", data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4">

      {/* Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8">

        {/* Logo / Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            CRM Portal
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            Login to access your dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 text-sm p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full mt-1 p-3 rounded-lg
                bg-white/20 text-white placeholder-gray-300
                border border-white/30
                focus:outline-none focus:ring-2 focus:ring-blue-400
                focus:border-transparent
                transition
              "
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full mt-1 p-3 rounded-lg
                bg-white/20 text-white placeholder-gray-300
                border border-white/30
                focus:outline-none focus:ring-2 focus:ring-blue-400
                focus:border-transparent
                transition
              "
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="
              w-full py-3 rounded-lg font-semibold
              bg-gradient-to-r from-blue-500 to-cyan-400
              hover:from-blue-600 hover:to-cyan-500
              text-white shadow-lg
              transition duration-300 transform hover:scale-[1.02]
            "
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} CRM System • Secure Login
        </p>
      </div>
    </div>
  );
}

export default Login;
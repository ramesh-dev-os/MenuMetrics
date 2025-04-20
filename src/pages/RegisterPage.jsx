import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [adminSecretKey, setAdminSecretKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (role === "admin" && adminSecretKey !== "admin123") {
      setError("Invalid admin secret key");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      setSuccessMessage(
        `Registration successful! Redirecting to ${role} dashboard...`
      );

      // Delay navigation to show success message
      setTimeout(() => {
        switch (role) {
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "manager":
            navigate("/manager-dashboard");
            break;
          case "staff":
            navigate("/staff-dashboard");
            break;
          default:
            navigate("/login");
        }
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("Email is already in use. Please use a different email.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left side - Image */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 justify-center items-center">
        <div className="max-w-md px-8">
          <h1 className="text-5xl font-bold text-white mb-6">MenuMetrics</h1>
          <p className="text-white text-xl">
            Join our platform and start optimizing your restaurant operations
            today with data-driven insights.
          </p>
          <div className="mt-8 space-y-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-white font-semibold">Reduce Food Waste</h3>
              <p className="text-white/80">
                Track and analyze waste patterns to make informed decisions.
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-white font-semibold">Increase Profits</h3>
              <p className="text-white/80">
                Optimize menu pricing and portions based on data insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600">Join MenuMetrics to start optimizing</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {role === "admin" && (
              <div>
                <label
                  htmlFor="adminSecretKey"
                  className="block text-sm font-medium text-gray-700"
                >
                  Admin Secret Key
                </label>
                <input
                  id="adminSecretKey"
                  type="password"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                  placeholder="Enter admin secret key"
                />
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
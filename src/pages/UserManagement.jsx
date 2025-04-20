import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { FaUserEdit, FaTrash, FaSearch, FaFilter, FaUserAlt, FaUserTie } from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      // Query users collection for staff and managers
      const q = query(
        collection(db, "users"),
        where("role", "in", ["manager", "staff"])
      );
      const querySnapshot = await getDocs(q);
      
      const userData = [];
      querySnapshot.forEach((doc) => {
        userData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let result = users;
    
    // Apply role filter
    if (filter !== "all") {
      result = result.filter(user => user.role === filter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        user =>
          user.fullName?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(result);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "staff",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      await updateDoc(doc(db, "users", selectedUser.id), {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setUsers(
        users.map(user =>
          user.id === selectedUser.id
            ? { ...user, ...formData, updatedAt: new Date().toISOString() }
            : user
        )
      );
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user. Please try again.");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteDoc(doc(db, "users", selectedUser.id));
      
      // Update local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user. Please try again.");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              filter === "all"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => handleFilterChange("manager")}
            className={`px-4 py-2 text-sm font-medium border-t border-b border-r flex items-center ${
              filter === "manager"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FaUserTie className="mr-1" /> Managers
          </button>
          <button
            onClick={() => handleFilterChange("staff")}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r flex items-center ${
              filter === "staff"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FaUserAlt className="mr-1" /> Staff
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No users found. {searchTerm && "Try adjusting your search."}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        {user.role === "manager" ? (
                          <FaUserTie className="text-indigo-600" size={18} />
                        ) : (
                          <FaUserAlt className="text-indigo-600" size={18} />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.phoneNumber || "Not provided"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "manager"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <FaUserEdit className="inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete the user{" "}
              <span className="font-semibold">{selectedUser?.fullName}</span>? This action
              cannot be undone.
            </p>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
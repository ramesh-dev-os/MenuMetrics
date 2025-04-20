import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import {
  FaEnvelope,
  FaUserPlus,
  FaTrash,
  FaSearch,
  FaUserClock,
  FaUserCheck,
  FaExclamationCircle,
} from "react-icons/fa";

const ManagerStaffManagement = ({ user }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePosition, setInvitePosition] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStaffAndInvitations();
    }
  }, [user]);

  const fetchStaffAndInvitations = async () => {
    setLoading(true);
    setError("");
    try {
      // Use user.uid as restaurantId if restaurantId is not available
      const restaurantId = user.restaurantId || user.uid;

      // Update user with restaurantId if not present
      if (!user.restaurantId) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            restaurantId: user.uid
          });
          console.log("Updated user with restaurantId");
        } catch (updateErr) {
          console.error("Error updating user with restaurantId:", updateErr);
        }
      }

      // Fetch staff members
      const staffQuery = query(
        collection(db, "users"),
        where("role", "==", "staff"),
        where("restaurantId", "==", restaurantId)
      );
      
      const staffSnapshot = await getDocs(staffQuery);
      const staffData = [];
      
      staffSnapshot.forEach((doc) => {
        staffData.push({
          id: doc.id,
          ...doc.data(),
          joinedAt: doc.data().joinedAt?.toDate(),
        });
      });
      
      setStaffMembers(staffData);
      
      // Fetch pending invitations
      const invitationsQuery = query(
        collection(db, "staffInvitations"),
        where("restaurantId", "==", restaurantId),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc")
      );
      
      const invitationsSnapshot = await getDocs(invitationsQuery);
      const invitationsData = [];
      
      invitationsSnapshot.forEach((doc) => {
        invitationsData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        });
      });
      
      setPendingInvitations(invitationsData);
    } catch (err) {
      console.error("Error fetching staff and invitations:", err);
      setError("Failed to load staff data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setError("");
    setSuccess("");
    
    // Basic email validation
    if (!inviteEmail.includes('@') || !inviteEmail.includes('.')) {
      setError("Please enter a valid email address");
      setInviteLoading(false);
      return;
    }
    
    if (!invitePosition.trim()) {
      setError("Please enter a position for the staff member");
      setInviteLoading(false);
      return;
    }
    
    try {
      // Use user.uid as restaurantId if restaurantId is not available
      const restaurantId = user.restaurantId || user.uid;
      
      // Check if email already has a pending invitation
      const existingInviteQuery = query(
        collection(db, "staffInvitations"),
        where("email", "==", inviteEmail),
        where("restaurantId", "==", restaurantId),
        where("status", "==", "pending")
      );
      
      const existingInviteSnapshot = await getDocs(existingInviteQuery);
      
      if (!existingInviteSnapshot.empty) {
        setError("An invitation has already been sent to this email address");
        setInviteLoading(false);
        return;
      }
      
      // Check if this email is already a staff member
      const existingStaffQuery = query(
        collection(db, "users"),
        where("email", "==", inviteEmail),
        where("restaurantId", "==", restaurantId)
      );
      
      const existingStaffSnapshot = await getDocs(existingStaffQuery);
      
      if (!existingStaffSnapshot.empty) {
        setError("This email is already associated with a staff member");
        setInviteLoading(false);
        return;
      }
      
      // Create invitation in Firestore
      const invitationData = {
        email: inviteEmail,
        position: invitePosition,
        restaurantId: restaurantId,
        restaurantName: user.restaurantName || "Restaurant",
        managerId: user.uid,
        managerName: user.fullName || "Manager",
        status: "pending",
        createdAt: Timestamp.now(),
      };
      
      await addDoc(collection(db, "staffInvitations"), invitationData);
      
      // Update local state
      setPendingInvitations([
        {
          ...invitationData,
          createdAt: invitationData.createdAt.toDate(),
        },
        ...pendingInvitations,
      ]);
      
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInvitePosition("");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error sending invitation:", err);
      setError("Failed to send invitation. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  const cancelInvitation = async (invitationId) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "staffInvitations", invitationId));
      
      // Update local state
      setPendingInvitations(pendingInvitations.filter(inv => inv.id !== invitationId));
    } catch (err) {
      console.error("Error canceling invitation:", err);
      setError("Failed to cancel invitation. Please try again.");
    }
  };

  const removeStaffMember = async (staffId, staffEmail) => {
    if (!window.confirm(`Are you sure you want to remove ${staffEmail} from your staff?`)) {
      return;
    }
    
    try {
      // Update user document to remove restaurant association
      await updateDoc(doc(db, "users", staffId), {
        restaurantId: null,
        restaurantName: null,
        position: null,
        joinedAt: null,
      });
      
      // Update local state
      setStaffMembers(staffMembers.filter(staff => staff.id !== staffId));
      
      setSuccess(`${staffEmail} has been removed from your staff`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error removing staff member:", err);
      setError("Failed to remove staff member. Please try again.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // Filter staff based on search term
  const filteredStaff = staffMembers.filter(staff => 
    staff.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
          <p className="text-gray-600">
            Manage staff for {user?.restaurantName || "Your Restaurant"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          {success}
        </div>
      )}

      {/* Invite Staff Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Invite New Staff Member
        </h3>
        <form onSubmit={sendInvitation} className="flex flex-col md:flex-row items-start md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="staff@example.com"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              value={invitePosition}
              onChange={(e) => setInvitePosition(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Chef, Waiter, Cashier, etc."
              required
            />
          </div>
          <button
            type="submit"
            disabled={inviteLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
          >
            <FaUserPlus className="mr-2" />
            {inviteLoading ? "Sending..." : "Send Invitation"}
          </button>
        </form>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pending Invitations
          </h3>
          <div className="bg-yellow-50 p-4 rounded-md mb-4 flex items-start">
            <FaExclamationCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
            <p className="text-sm text-yellow-700">
              These invitations are waiting for staff members to accept. Staff members will need to register or login with these exact email addresses to join your restaurant.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invited On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingInvitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-yellow-100 rounded-full">
                          <FaUserClock className="text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {invitation.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invitation.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invitation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => cancelInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline mr-1" /> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Members List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Current Staff Members
          </h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchTerm ? (
              "No staff members found matching your search."
            ) : (
              "No staff members yet. Invite staff using the form above."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-green-100 rounded-full">
                          <FaUserCheck className="text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {staff.fullName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {staff.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staff.position || "Not specified"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(staff.joinedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeStaffMember(staff.id, staff.email)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline mr-1" /> Remove
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
  );
};

export default ManagerStaffManagement;
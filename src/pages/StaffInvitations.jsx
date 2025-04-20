import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import {
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const StaffInvitations = ({ user, onAcceptInvitation }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingInvitationId, setProcessingInvitationId] = useState(null);

  useEffect(() => {
    if (user && user.email) {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    setLoading(true);
    setError("");
    try {
      // Query for pending invitations for this user's email
      const invitationsQuery = query(
        collection(db, "staffInvitations"),
        where("email", "==", user.email),
        where("status", "==", "pending")
      );
      
      const querySnapshot = await getDocs(invitationsQuery);
      const invitationsData = [];
      
      querySnapshot.forEach((doc) => {
        invitationsData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        });
      });
      
      setInvitations(invitationsData);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError("Failed to load invitations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitation) => {
    setProcessingInvitationId(invitation.id);
    setError("");
    setSuccess("");
    
    try {
      // Update the invitation status
      await updateDoc(doc(db, "staffInvitations", invitation.id), {
        status: "accepted",
        acceptedAt: Timestamp.now(),
      });
      
      // Update the user profile with restaurant information
      await updateDoc(doc(db, "users", user.uid), {
        restaurantId: invitation.restaurantId,
        restaurantName: invitation.restaurantName,
        position: invitation.position,
        joinedAt: Timestamp.now(),
        // Make sure role is staff
        role: "staff",
      });
      
      // Update local state
      setInvitations(invitations.filter(inv => inv.id !== invitation.id));
      
      setSuccess(`You've successfully joined ${invitation.restaurantName}`);
      
      // Notify parent component about the change
      if (onAcceptInvitation) {
        onAcceptInvitation({
          restaurantId: invitation.restaurantId,
          restaurantName: invitation.restaurantName,
          position: invitation.position,
        });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError("Failed to accept invitation. Please try again.");
    } finally {
      setProcessingInvitationId(null);
    }
  };

  const declineInvitation = async (invitationId) => {
    setProcessingInvitationId(invitationId);
    setError("");
    setSuccess("");
    
    try {
      // Update the invitation status
      await updateDoc(doc(db, "staffInvitations", invitationId), {
        status: "declined",
        declinedAt: Timestamp.now(),
      });
      
      // Update local state
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      setSuccess("Invitation declined");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error declining invitation:", err);
      setError("Failed to decline invitation. Please try again.");
    } finally {
      setProcessingInvitationId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // If no pending invitations, don't render anything
  if (invitations.length === 0 && !loading && !error && !success) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Restaurant Invitations</h3>
      
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          {success}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          No pending invitations
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div 
              key={invitation.id} 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                  <FaBuilding className="text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {invitation.restaurantName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Position: {invitation.position}
                      </p>
                      <p className="text-sm text-gray-500">
                        Invited by: {invitation.managerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {formatDate(invitation.createdAt)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acceptInvitation(invitation)}
                        disabled={processingInvitationId === invitation.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                      >
                        <FaCheckCircle className="mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => declineInvitation(invitation.id)}
                        disabled={processingInvitationId === invitation.id}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                      >
                        <FaTimesCircle className="mr-2" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 bg-blue-50 p-4 rounded-md flex items-start">
            <FaExclamationCircle className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Accepting an invitation will associate your account with the restaurant. You'll be able to access restaurant-specific features and data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffInvitations;
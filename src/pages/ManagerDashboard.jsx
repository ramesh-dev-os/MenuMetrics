// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { auth, db } from "../firebase";
// // import { signOut } from "firebase/auth";
// // import { doc, getDoc } from "firebase/firestore";
// // import { 
// //   FaUtensils, 
// //   FaUserCircle, 
// //   FaClipboardList, 
// //   FaChartBar, 
// //   FaBars, 
// //   FaTimes, 
// //   FaUsers, 
// //   FaUserCheck,
// //   FaComments
// // } from "react-icons/fa";
// // import ManagerProfile from "./ManagerProfile";
// // import NotificationBell from "./NotificationBell";
// // import ManagerInventoryManagement from "./ManagerInventoryManagement";
// // import ManagerStaffManagement from "./ManagerStaffManagement";
// // import ManagerMenuManagement from "./ManagerMenuManagement";
// // import StaffPerformance from "./StaffPerformance";
// // import FeedbackManagement from "./FeedbackManagement";

// // const ManagerDashboard = () => {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [activeTab, setActiveTab] = useState("profile");
// //   const [sidebarOpen, setSidebarOpen] = useState(true);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const fetchUserData = async () => {
// //       try {
// //         const currentUser = auth.currentUser;
// //         if (!currentUser) {
// //           navigate("/login");
// //           return;
// //         }

// //         const userDoc = await getDoc(doc(db, "users", currentUser.uid));
// //         if (userDoc.exists()) {
// //           const userData = userDoc.data();
// //           if (userData.role !== "manager") {
// //             // Redirect if not manager
// //             navigate("/login");
// //             return;
// //           }
// //           setUser({
// //             uid: currentUser.uid,
// //             email: currentUser.email,
// //             ...userData,
// //           });
// //         } else {
// //           navigate("/login");
// //         }
// //       } catch (error) {
// //         console.error("Error fetching user data:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchUserData();
// //   }, [navigate]);

// //   const handleLogout = async () => {
// //     try {
// //       await signOut(auth);
// //       navigate("/login");
// //     } catch (error) {
// //       console.error("Error logging out:", error);
// //     }
// //   };

// //   const toggleSidebar = () => {
// //     setSidebarOpen(!sidebarOpen);
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-100">
// //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex h-screen bg-gray-100">
// //       {/* Sidebar */}
// //       <div
// //         className={`${
// //           sidebarOpen ? "w-64" : "w-16"
// //         } bg-green-800 text-white transition-all duration-300 ease-in-out fixed md:static inset-y-0 left-0 z-30`}
// //       >
// //         <div className="flex items-center justify-between h-16 px-4 bg-green-900">
// //           {sidebarOpen && (
// //             <div className="font-bold text-xl">MenuMetrics</div>
// //           )}
// //           <button
// //             onClick={toggleSidebar}
// //             className={`p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 ${sidebarOpen ? "ml-auto" : "mx-auto"}`}
// //           >
// //             {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
// //           </button>
// //         </div>

// //         {/* Full sidebar for larger screens */}
// //         {sidebarOpen ? (
// //           <nav className="mt-5 px-2">
// //             <div className="space-y-2">
// //               <button
// //                 onClick={() => setActiveTab("profile")}
// //                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
// //                   activeTab === "profile" ? "bg-green-700" : ""
// //                 }`}
// //               >
// //                 <FaUserCircle className="mr-3" size={18} />
// //                 <span>Profile</span>
// //               </button>
              
// //               <button
// //                 onClick={() => setActiveTab("staff")}
// //                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
// //                   activeTab === "staff" ? "bg-green-700" : ""
// //                 }`}
// //               >
// //                 <FaUsers className="mr-3" size={18} />
// //                 <span>Staff Management</span>
// //               </button>
              
// //               <button
// //                 onClick={() => setActiveTab("performance")}
// //                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
// //                   activeTab === "performance" ? "bg-green-700" : ""
// //                 }`}
// //               >
// //                 <FaUserCheck className="mr-3" size={18} />
// //                 <span>Staff Performance</span>
// //               </button>
              
// //               <button
// //                 onClick={() => setActiveTab("menu")}
// //                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
// //                   activeTab === "menu" ? "bg-green-700" : ""
// //                 }`}
// //               >
// //                 <FaUtensils className="mr-3" size={18} />
// //                 <span>Menu Management</span>
// //               </button>
              
// //               <button
// //                 onClick={() => setActiveTab("inventory")}
// //                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
// //                   activeTab === "inventory" ? "bg-green-700" : ""
// //                 }`}
// //               >
// //                 <FaClipboardList className="mr-3" size={18} />
// //                 <span>Inventory</span>
// //               </button>
              
// //               <button
// //                 onClick={() => setActiveTab("feedback")}
// //                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
// //                   activeTab === "feedback" ? "bg-green-700" : ""
// //                 }`}
// //               >
// //                 <FaComments className="mr-3" size={18} />
// //                 <span>Feedback</span>
// //               </button>
              
// //               <button
// //                 onClick={() => setActiveTab("analytics")}
// //                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
// //                   activeTab === "analytics" ? "bg-green-700" : ""
// //                 }`}
// //               >
// //                 <FaChartBar className="mr-3" size={18} />
// //                 <span>Analytics</span>
// //               </button>
// //             </div>
// //           </nav>
// //         ) : (
// //           /* Collapsed sidebar with only icons */
// //           <nav className="mt-8">
// //             <div className="flex flex-col items-center space-y-8">
// //               <button
// //                 onClick={() => setActiveTab("profile")}
// //                 className={`p-3 rounded-full ${
// //                   activeTab === "profile" ? "bg-green-700" : "hover:bg-green-700"
// //                 }`}
// //                 title="Profile"
// //               >
// //                 <FaUserCircle size={22} />
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("staff")}
// //                 className={`p-3 rounded-full ${
// //                   activeTab === "staff" ? "bg-green-700" : "hover:bg-green-700"
// //                 }`}
// //                 title="Staff Management"
// //               >
// //                 <FaUsers size={22} />
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("performance")}
// //                 className={`p-3 rounded-full ${
// //                   activeTab === "performance" ? "bg-green-700" : "hover:bg-green-700"
// //                 }`}
// //                 title="Staff Performance"
// //               >
// //                 <FaUserCheck size={22} />
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("menu")}
// //                 className={`p-3 rounded-full ${
// //                   activeTab === "menu" ? "bg-green-700" : "hover:bg-green-700"
// //                 }`}
// //                 title="Menu Management"
// //               >
// //                 <FaUtensils size={22} />
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("inventory")}
// //                 className={`p-3 rounded-full ${
// //                   activeTab === "inventory" ? "bg-green-700" : "hover:bg-green-700"
// //                 }`}
// //                 title="Inventory"
// //               >
// //                 <FaClipboardList size={22} />
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("feedback")}
// //                 className={`p-3 rounded-full ${
// //                   activeTab === "feedback" ? "bg-green-700" : "hover:bg-green-700"
// //                 }`}
// //                 title="Feedback"
// //               >
// //                 <FaComments size={22} />
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("analytics")}
// //                 className={`p-3 rounded-full ${
// //                   activeTab === "analytics" ? "bg-green-700" : "hover:bg-green-700"
// //                 }`}
// //                 title="Analytics"
// //               >
// //                 <FaChartBar size={22} />
// //               </button>
// //             </div>
// //           </nav>
// //         )}
// //       </div>

// //       {/* Main Content */}
// //       <div className="flex-1 flex flex-col overflow-hidden">
// //         {/* Navbar */}
// //         <header className="bg-white shadow-sm">
// //           <div className="flex items-center justify-between h-16 px-6">
// //             <button
// //               onClick={toggleSidebar}
// //               className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 md:hidden"
// //             >
// //               <FaBars size={20} />
// //             </button>
// //             <div className="text-xl font-semibold text-gray-800 md:hidden">
// //               MenuMetrics - Manager
// //             </div>
// //             <div className="flex items-center">
// //               <NotificationBell />
// //               <div className="mx-4 text-gray-700">
// //                 Welcome, {user?.fullName}
// //               </div>
// //               <button
// //                 onClick={handleLogout}
// //                 className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
// //               >
// //                 Logout
// //               </button>
// //             </div>
// //           </div>
// //         </header>

// //         {/* Main content area */}
// //         <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
// //           {activeTab === "profile" && <ManagerProfile user={user} />}
          
// //           {activeTab === "staff" && <ManagerStaffManagement user={user} />}
          
// //           {activeTab === "performance" && <StaffPerformance user={user} />}
          
// //           {activeTab === "menu" && (
// //             <ManagerMenuManagement user={user} />
// //           )}
          
// //           {activeTab === "inventory" && <ManagerInventoryManagement user={user} />}
          
// //           {activeTab === "feedback" && <FeedbackManagement user={user} />}
          
// //           {activeTab === "analytics" && (
// //             <div className="bg-white shadow-md rounded-lg p-6">
// //               <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
// //               <div className="p-10 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
// //                 <p className="text-gray-500 text-lg">Analytics functionality to be implemented here</p>
// //               </div>
// //             </div>
// //           )}
// //         </main>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ManagerDashboard;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, db } from "../firebase";
// import { signOut } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { 
//   FaUtensils, 
//   FaUserCircle, 
//   FaClipboardList, 
//   FaChartBar, 
//   FaBars, 
//   FaTimes, 
//   FaUsers, 
//   FaUserCheck,
//   FaComments,
//   FaEnvelope
// } from "react-icons/fa";
// import ManagerProfile from "./ManagerProfile";
// import NotificationBell from "./NotificationBell";
// import ManagerInventoryManagement from "./ManagerInventoryManagement";
// import ManagerStaffManagement from "./ManagerStaffManagement";
// import ManagerMenuManagement from "./ManagerMenuManagement";
// import StaffPerformance from "./StaffPerformance";
// import FeedbackManagement from "./FeedbackManagement";
// import Messages from "./Messages";

// const ManagerDashboard = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const currentUser = auth.currentUser;
//         if (!currentUser) {
//           navigate("/login");
//           return;
//         }

//         const userDoc = await getDoc(doc(db, "users", currentUser.uid));
//         if (userDoc.exists()) {
//           const userData = userDoc.data();
//           if (userData.role !== "manager") {
//             // Redirect if not manager
//             navigate("/login");
//             return;
//           }
//           setUser({
//             uid: currentUser.uid,
//             email: currentUser.email,
//             ...userData,
//           });
//         } else {
//           navigate("/login");
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [navigate]);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate("/login");
//     } catch (error) {
//       console.error("Error logging out:", error);
//     }
//   };

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div
//         className={`${
//           sidebarOpen ? "w-64" : "w-16"
//         } bg-green-800 text-white transition-all duration-300 ease-in-out fixed md:static inset-y-0 left-0 z-30`}
//       >
//         <div className="flex items-center justify-between h-16 px-4 bg-green-900">
//           {sidebarOpen && (
//             <div className="font-bold text-xl">MenuMetrics</div>
//           )}
//           <button
//             onClick={toggleSidebar}
//             className={`p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 ${sidebarOpen ? "ml-auto" : "mx-auto"}`}
//           >
//             {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
//           </button>
//         </div>

//         {/* Full sidebar for larger screens */}
//         {sidebarOpen ? (
//           <nav className="mt-5 px-2">
//             <div className="space-y-2">
//               <button
//                 onClick={() => setActiveTab("profile")}
//                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
//                   activeTab === "profile" ? "bg-green-700" : ""
//                 }`}
//               >
//                 <FaUserCircle className="mr-3" size={18} />
//                 <span>Profile</span>
//               </button>
              
//               <button
//                 onClick={() => setActiveTab("staff")}
//                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
//                   activeTab === "staff" ? "bg-green-700" : ""
//                 }`}
//               >
//                 <FaUsers className="mr-3" size={18} />
//                 <span>Staff Management</span>
//               </button>
              
//               <button
//                 onClick={() => setActiveTab("performance")}
//                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
//                   activeTab === "performance" ? "bg-green-700" : ""
//                 }`}
//               >
//                 <FaUserCheck className="mr-3" size={18} />
//                 <span>Staff Performance</span>
//               </button>
              
//               <button
//                 onClick={() => setActiveTab("messages")}
//                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
//                   activeTab === "messages" ? "bg-green-700" : ""
//                 }`}
//               >
//                 <FaEnvelope className="mr-3" size={18} />
//                 <span>Messages</span>
//               </button>
              
//               <button
//                 onClick={() => setActiveTab("menu")}
//                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
//                   activeTab === "menu" ? "bg-green-700" : ""
//                 }`}
//               >
//                 <FaUtensils className="mr-3" size={18} />
//                 <span>Menu Management</span>
//               </button>
              
//               <button
//                 onClick={() => setActiveTab("inventory")}
//                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
//                   activeTab === "inventory" ? "bg-green-700" : ""
//                 }`}
//               >
//                 <FaClipboardList className="mr-3" size={18} />
//                 <span>Inventory</span>
//               </button>
              
//               <button
//                 onClick={() => setActiveTab("feedback")}
//                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
//                   activeTab === "feedback" ? "bg-green-700" : ""
//                 }`}
//               >
//                 <FaComments className="mr-3" size={18} />
//                 <span>Feedback</span>
//               </button>
              
//               <button
//                 onClick={() => setActiveTab("analytics")}
//                 className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
//                   activeTab === "analytics" ? "bg-green-700" : ""
//                 }`}
//               >
//                 <FaChartBar className="mr-3" size={18} />
//                 <span>Analytics</span>
//               </button>
//             </div>
//           </nav>
//         ) : (
//           /* Collapsed sidebar with only icons */
//           <nav className="mt-8">
//             <div className="flex flex-col items-center space-y-8">
//               <button
//                 onClick={() => setActiveTab("profile")}
//                 className={`p-3 rounded-full ${
//                   activeTab === "profile" ? "bg-green-700" : "hover:bg-green-700"
//                 }`}
//                 title="Profile"
//               >
//                 <FaUserCircle size={22} />
//               </button>
//               <button
//                 onClick={() => setActiveTab("staff")}
//                 className={`p-3 rounded-full ${
//                   activeTab === "staff" ? "bg-green-700" : "hover:bg-green-700"
//                 }`}
//                 title="Staff Management"
//               >
//                 <FaUsers size={22} />
//               </button>
//               <button
//                 onClick={() => setActiveTab("performance")}
//                 className={`p-3 rounded-full ${
//                   activeTab === "performance" ? "bg-green-700" : "hover:bg-green-700"
//                 }`}
//                 title="Staff Performance"
//               >
//                 <FaUserCheck size={22} />
//               </button>
//               <button
//                 onClick={() => setActiveTab("messages")}
//                 className={`p-3 rounded-full ${
//                   activeTab === "messages" ? "bg-green-700" : "hover:bg-green-700"
//                 }`}
//                 title="Messages"
//               >
//                 <FaEnvelope size={22} />
//               </button>
//               <button
//                 onClick={() => setActiveTab("menu")}
//                 className={`p-3 rounded-full ${
//                   activeTab === "menu" ? "bg-green-700" : "hover:bg-green-700"
//                 }`}
//                 title="Menu Management"
//               >
//                 <FaUtensils size={22} />
//               </button>
//               <button
//                 onClick={() => setActiveTab("inventory")}
//                 className={`p-3 rounded-full ${
//                   activeTab === "inventory" ? "bg-green-700" : "hover:bg-green-700"
//                 }`}
//                 title="Inventory"
//               >
//                 <FaClipboardList size={22} />
//               </button>
//               <button
//                 onClick={() => setActiveTab("feedback")}
//                 className={`p-3 rounded-full ${
//                   activeTab === "feedback" ? "bg-green-700" : "hover:bg-green-700"
//                 }`}
//                 title="Feedback"
//               >
//                 <FaComments size={22} />
//               </button>
//               <button
//                 onClick={() => setActiveTab("analytics")}
//                 className={`p-3 rounded-full ${
//                   activeTab === "analytics" ? "bg-green-700" : "hover:bg-green-700"
//                 }`}
//                 title="Analytics"
//               >
//                 <FaChartBar size={22} />
//               </button>
//             </div>
//           </nav>
//         )}
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Navbar */}
//         <header className="bg-white shadow-sm">
//           <div className="flex items-center justify-between h-16 px-6">
//             <button
//               onClick={toggleSidebar}
//               className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 md:hidden"
//             >
//               <FaBars size={20} />
//             </button>
//             <div className="text-xl font-semibold text-gray-800 md:hidden">
//               MenuMetrics - Manager
//             </div>
//             <div className="flex items-center">
//               <NotificationBell />
//               <div className="mx-4 text-gray-700">
//                 Welcome, {user?.fullName}
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* Main content area */}
//         <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
//           {activeTab === "profile" && <ManagerProfile user={user} />}
          
//           {activeTab === "staff" && <ManagerStaffManagement user={user} />}
          
//           {activeTab === "performance" && <StaffPerformance user={user} />}
          
//           {activeTab === "messages" && <Messages user={user} />}
          
//           {activeTab === "menu" && (
//             <ManagerMenuManagement user={user} />
//           )}
          
//           {activeTab === "inventory" && <ManagerInventoryManagement user={user} />}
          
//           {activeTab === "feedback" && <FeedbackManagement user={user} />}
          
//           {activeTab === "analytics" && (
//             <div className="bg-white shadow-md rounded-lg p-6">
//               <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
//               <div className="p-10 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
//                 <p className="text-gray-500 text-lg">Analytics functionality to be implemented here</p>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default ManagerDashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { 
  FaUtensils, 
  FaUserCircle, 
  FaClipboardList, 
  FaChartBar, 
  FaBars, 
  FaTimes, 
  FaUsers, 
  FaUserCheck,
  FaComments,
  FaEnvelope,
  FaBell
} from "react-icons/fa";
import ManagerProfile from "./ManagerProfile";
import NotificationBell from "./NotificationBell";
import ManagerInventoryManagement from "./ManagerInventoryManagement";
import ManagerStaffManagement from "./ManagerStaffManagement";
import ManagerMenuManagement from "./ManagerMenuManagement";
import StaffPerformance from "./StaffPerformance";
import FeedbackManagement from "./FeedbackManagement";
import Messages from "./Messages";
import NotificationsDisplay from "./NotificationsDisplay";

const ManagerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate("/login");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role !== "manager") {
            // Redirect if not manager
            navigate("/login");
            return;
          }
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            ...userData,
          });
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-green-800 text-white transition-all duration-300 ease-in-out fixed md:static inset-y-0 left-0 z-30`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-green-900">
          {sidebarOpen && (
            <div className="font-bold text-xl">MenuMetrics</div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 ${sidebarOpen ? "ml-auto" : "mx-auto"}`}
          >
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Full sidebar for larger screens */}
        {sidebarOpen ? (
          <nav className="mt-5 px-2">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
                activeTab === "profile" ? "bg-green-700" : ""
              }`}
            >
              <FaUserCircle className="mr-3" size={18} />
              <span>Profile</span>
            </button>
            
            <button
              onClick={() => setActiveTab("staff")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
                activeTab === "staff" ? "bg-green-700" : ""
              }`}
            >
              <FaUsers className="mr-3" size={18} />
              <span>Staff Management</span>
            </button>
            
            <button
              onClick={() => setActiveTab("performance")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
                activeTab === "performance" ? "bg-green-700" : ""
              }`}
            >
              <FaUserCheck className="mr-3" size={18} />
              <span>Staff Performance</span>
            </button>
            
            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
                activeTab === "messages" ? "bg-green-700" : ""
              }`}
            >
              <FaEnvelope className="mr-3" size={18} />
              <span>Messages</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
                activeTab === "notifications" ? "bg-green-700" : ""
              }`}
            >
              <FaBell className="mr-3" size={18} />
              <span>Notifications</span>
            </button>
            
            <button
              onClick={() => setActiveTab("menu")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
                activeTab === "menu" ? "bg-green-700" : ""
              }`}
            >
              <FaUtensils className="mr-3" size={18} />
              <span>Menu Management</span>
            </button>
            
            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
                activeTab === "inventory" ? "bg-green-700" : ""
              }`}
            >
              <FaClipboardList className="mr-3" size={18} />
              <span>Inventory</span>
            </button>
            
            <button
              onClick={() => setActiveTab("feedback")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
                activeTab === "feedback" ? "bg-green-700" : ""
              }`}
            >
              <FaComments className="mr-3" size={18} />
              <span>Feedback</span>
            </button>
            
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-green-700 ${
                activeTab === "analytics" ? "bg-green-700" : ""
              }`}
            >
              <FaChartBar className="mr-3" size={18} />
              <span>Analytics</span>
            </button>
          </div>
        </nav>
        ) : (
          /* Collapsed sidebar with only icons */
          <nav className="mt-8">
            <div className="flex flex-col items-center space-y-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`p-3 rounded-full ${
                  activeTab === "profile" ? "bg-green-700" : "hover:bg-green-700"
                }`}
                title="Profile"
              >
                <FaUserCircle size={22} />
              </button>
              <button
                onClick={() => setActiveTab("staff")}
                className={`p-3 rounded-full ${
                  activeTab === "staff" ? "bg-green-700" : "hover:bg-green-700"
                }`}
                title="Staff Management"
              >
                <FaUsers size={22} />
              </button>
              <button
                onClick={() => setActiveTab("performance")}
                className={`p-3 rounded-full ${
                  activeTab === "performance" ? "bg-green-700" : "hover:bg-green-700"
                }`}
                title="Staff Performance"
              >
                <FaUserCheck size={22} />
              </button>
              <button
                onClick={() => setActiveTab("messages")}
                className={`p-3 rounded-full ${
                  activeTab === "messages" ? "bg-green-700" : "hover:bg-green-700"
                }`}
                title="Messages"
              >
                <FaEnvelope size={22} />
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`p-3 rounded-full ${
                  activeTab === "notifications" ? "bg-green-700" : "hover:bg-green-700"
                }`}
                title="Notifications"
              >
                <FaBell size={22} />
              </button>
              <button
                onClick={() => setActiveTab("menu")}
                className={`p-3 rounded-full ${
                  activeTab === "menu" ? "bg-green-700" : "hover:bg-green-700"
                }`}
                title="Menu Management"
              >
                <FaUtensils size={22} />
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`p-3 rounded-full ${
                  activeTab === "inventory" ? "bg-green-700" : "hover:bg-green-700"
                }`}
                title="Inventory"
              >
                <FaClipboardList size={22} />
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`p-3 rounded-full ${
                  activeTab === "feedback" ? "bg-green-700" : "hover:bg-green-700"
                }`}
                title="Feedback"
              >
                <FaComments size={22} />
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`p-3 rounded-full ${
                  activeTab === "analytics" ? "bg-green-700" : "hover:bg-green-700"
                }`}
                title="Analytics"
              >
                <FaChartBar size={22} />
              </button>
            </div>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 md:hidden"
            >
              <FaBars size={20} />
            </button>
            <div className="text-xl font-semibold text-gray-800 md:hidden">
              MenuMetrics - Manager
            </div>
            <div className="flex items-center">
              <NotificationBell />
              <div className="mx-4 text-gray-700">
                Welcome, {user?.fullName}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
        {activeTab === "profile" && <ManagerProfile user={user} />}
          
          {activeTab === "staff" && <ManagerStaffManagement user={user} />}
          
          {activeTab === "performance" && <StaffPerformance user={user} />}
          
          {activeTab === "messages" && <Messages user={user} />}
          
          {activeTab === "notifications" && <NotificationsDisplay user={user} />}
          
          {activeTab === "menu" && (
            <ManagerMenuManagement user={user} />
          )}
          
          {activeTab === "inventory" && <ManagerInventoryManagement user={user} />}
          
          {activeTab === "feedback" && <FeedbackManagement user={user} />}
          
          {activeTab === "analytics" && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
              <div className="p-10 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 text-lg">Analytics functionality to be implemented here</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
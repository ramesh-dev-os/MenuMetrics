import { 
  FaShoppingCart, 
  FaUserCircle, 
  FaReceipt, 
  FaTrash, 
  FaBars, 
  FaTimes, 
  FaChartLine,
  FaUtensils,
  FaComments,
  FaEnvelope,
  FaBell
} from "react-icons/fa";
import StaffProfile from "./StaffProfile";
import NotificationBell from "./NotificationBell";
import StaffInvitations from "./StaffInvitations";
import OrderManagement from "./OrderManagement";
import PerformanceCheck from "./PerformanceCheck";
import MenuDisplay from "./MenuDisplay";
import Feedback from "./Feedback";
import Messages from "./Messages";
import NotificationsDisplay from "./NotificationsDisplay";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef , useContext } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const StaffDashboard = () => {
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
          if (userData.role !== "staff") {
            // Redirect if not staff
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-blue-800 text-white transition-all duration-300 ease-in-out fixed md:static inset-y-0 left-0 z-30`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-blue-900">
          {sidebarOpen && (
            <div className="font-bold text-xl">MenuMetrics</div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${sidebarOpen ? "ml-auto" : "mx-auto"}`}
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
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-blue-700 ${
                activeTab === "profile" ? "bg-blue-700" : ""
              }`}
            >
              <FaUserCircle className="mr-3" size={18} />
              <span>Profile</span>
            </button>
            
            <button
              onClick={() => setActiveTab("menu")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-blue-700 ${
                activeTab === "menu" ? "bg-blue-700" : ""
              }`}
            >
              <FaUtensils className="mr-3" size={18} />
              <span>Menu</span>
            </button>
            
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-blue-700 ${
                activeTab === "orders" ? "bg-blue-700" : ""
              }`}
            >
              <FaShoppingCart className="mr-3" size={18} />
              <span>Orders</span>
            </button>
            
            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-blue-700 ${
                activeTab === "messages" ? "bg-blue-700" : ""
              }`}
            >
              <FaEnvelope className="mr-3" size={18} />
              <span>Messages</span>
            </button>
            
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-blue-700 ${
                activeTab === "notifications" ? "bg-blue-700" : ""
              }`}
            >
              <FaBell className="mr-3" size={18} />
              <span>Notifications</span>
            </button>
            
            <button
              onClick={() => setActiveTab("performance")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-blue-700 ${
                activeTab === "performance" ? "bg-blue-700" : ""
              }`}
            >
              <FaChartLine className="mr-3" size={18} />
              <span>Performance</span>
            </button>
            
            <button
              onClick={() => setActiveTab("receipts")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-blue-700 ${
                activeTab === "receipts" ? "bg-blue-700" : ""
              }`}
            >
              <FaReceipt className="mr-3" size={18} />
              <span>Receipts</span>
            </button>
            
            <button
              onClick={() => setActiveTab("waste")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-blue-700 ${
                activeTab === "waste" ? "bg-blue-700" : ""
              }`}
            >
              <FaTrash className="mr-3" size={18} />
              <span>Waste Logging</span>
            </button>
            
            <button
              onClick={() => setActiveTab("feedback")}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md hover:bg-blue-700 ${
                activeTab === "feedback" ? "bg-blue-700" : ""
              }`}
            >
              <FaComments className="mr-3" size={18} />
              <span>Give Feedback</span>
            </button>
          </div>
        </nav>
        ) : (
<nav className="mt-8">
            <div className="flex flex-col items-center space-y-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`p-3 rounded-full ${
                  activeTab === "profile" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                title="Profile"
              >
                <FaUserCircle size={22} />
              </button>
              <button
                onClick={() => setActiveTab("menu")}
                className={`p-3 rounded-full ${
                  activeTab === "menu" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                title="Menu"
              >
                <FaUtensils size={22} />
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`p-3 rounded-full ${
                  activeTab === "orders" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                title="Orders"
              >
                <FaShoppingCart size={22} />
              </button>
              <button
                onClick={() => setActiveTab("messages")}
                className={`p-3 rounded-full ${
                  activeTab === "messages" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                title="Messages"
              >
                <FaEnvelope size={22} />
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`p-3 rounded-full ${
                  activeTab === "notifications" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                title="Notifications"
              >
                <FaBell size={22} />
              </button>
              <button
                onClick={() => setActiveTab("performance")}
                className={`p-3 rounded-full ${
                  activeTab === "performance" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                title="Performance"
              >
                <FaChartLine size={22} />
              </button>
              <button
                onClick={() => setActiveTab("receipts")}
                className={`p-3 rounded-full ${
                  activeTab === "receipts" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                title="Receipts"
              >
                <FaReceipt size={22} />
              </button>
              <button
                onClick={() => setActiveTab("waste")}
                className={`p-3 rounded-full ${
                  activeTab === "waste" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                title="Waste Logging"
              >
                <FaTrash size={22} />
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`p-3 rounded-full ${
                  activeTab === "feedback" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                title="Give Feedback"
              >
                <FaComments size={22} />
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
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
            >
              <FaBars size={20} />
            </button>
            <div className="text-xl font-semibold text-gray-800 md:hidden">
              MenuMetrics - Staff
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
          {/* Display staff invitations if not associated with a restaurant */}
          {(!user.restaurantId || !user.restaurantName) && (
            <StaffInvitations 
              user={user} 
              onAcceptInvitation={(restaurantData) => {
                // Update local user state with restaurant data
                setUser({
                  ...user,
                  ...restaurantData,
                  joinedAt: new Date(),
                });
              }} 
            />
          )}
          
          {activeTab === "profile" && <StaffProfile user={user} />}
          
          {activeTab === "menu" && <MenuDisplay user={user} />}
          
          {activeTab === "messages" && <Messages user={user} />}

          {activeTab === "notifications" && <NotificationsDisplay user={user} />}
          
          {activeTab === "performance" && <PerformanceCheck user={user} />}
          
          {activeTab === "receipts" && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Receipts</h2>
              <div className="p-10 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 text-lg">Receipts functionality to be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === "orders" && <OrderManagement user={user} />}
          
          {activeTab === "waste" && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Waste Logging</h2>
              <div className="p-10 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 text-lg">Waste logging functionality to be implemented here</p>
              </div>
            </div>
          )}
          
          {activeTab === "feedback" && <Feedback user={user} />}
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;
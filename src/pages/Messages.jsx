// import React, { useState, useEffect, useRef } from "react";
// import { db } from "../firebase";
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   addDoc,
//   onSnapshot,
//   Timestamp,
//   getDocs,
//   getDoc,
//   doc,
// } from "firebase/firestore";
// import {
//   FaRegPaperPlane,
//   FaSpinner,
//   FaRegClock,
//   FaCheckDouble,
//   FaSearch,
//   FaUserCircle,
// } from "react-icons/fa";

// const Messages = ({ user }) => {
//   const [loading, setLoading] = useState(true);
//   const [staffMembers, setStaffMembers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messageText, setMessageText] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const messagesEndRef = useRef(null);
//   const chatContainerRef = useRef(null);

//   // Initial data load - fetch staff members
//   useEffect(() => {
//     if (!user) return;
    
//     fetchStaffMembers();
//   }, [user]);
  
//   // Set up listener for new messages when a user is selected
//   useEffect(() => {
//     if (!user || !selectedUser) return;
    
//     const chatId = getChatId(user.uid, selectedUser.id);
    
//     const messagesQuery = query(
//       collection(db, "messages"),
//       where("chatId", "==", chatId),
//       orderBy("timestamp", "asc")
//     );
    
//     const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
//       const messagesList = [];
//       querySnapshot.forEach((doc) => {
//         messagesList.push({
//           id: doc.id,
//           ...doc.data(),
//           timestamp: doc.data().timestamp?.toDate()
//         });
//       });
      
//       setMessages(messagesList);
//     });
    
//     return () => unsubscribe();
//   }, [user, selectedUser]);
  
//   // Scroll to bottom when messages change
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);
  
//   // Filter staff members when search term changes
//   useEffect(() => {
//     if (searchTerm.trim() === "") return;
    
//     const filtered = staffMembers.filter(member => 
//       member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       member.position?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
    
//     setStaffMembers(filtered);
//   }, [searchTerm]);
  
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };
  
//   // Get a unique chat ID for the conversation between two users
//   const getChatId = (uid1, uid2) => {
//     return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
//   };

//   const fetchStaffMembers = async () => {
//     setLoading(true);
//     setError("");
    
//     try {
//       // For manager: fetch all staff members in their restaurant
//       // For staff: fetch the manager
//       let queryResult;
      
//       if (user.role === "manager") {
//         const restaurantId = user.restaurantId || user.uid;
//         const staffQuery = query(
//           collection(db, "users"),
//           where("restaurantId", "==", restaurantId),
//           where("role", "==", "staff")
//         );
//         queryResult = await getDocs(staffQuery);
//       } else if (user.role === "staff") {
//         // Find the manager based on restaurantId
//         const managerQuery = query(
//           collection(db, "users"),
//           where("restaurantId", "==", user.restaurantId),
//           where("role", "==", "manager")
//         );
//         queryResult = await getDocs(managerQuery);
//       }
      
//       const members = [];
//       queryResult.forEach((doc) => {
//         members.push({
//           id: doc.id,
//           ...doc.data()
//         });
//       });
      
//       setStaffMembers(members);
      
//       // Auto-select if there's only one option (for staff)
//       if (members.length === 1 && user.role === "staff") {
//         setSelectedUser(members[0]);
//       }
      
//     } catch (err) {
//       console.error("Error fetching users:", err);
//       setError("Failed to load contacts. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
    
//     if (!messageText.trim()) return;
//     if (!selectedUser) return;
    
//     setSending(true);
    
//     try {
//       const chatId = getChatId(user.uid, selectedUser.id);
      
//       await addDoc(collection(db, "messages"), {
//         chatId: chatId,
//         senderId: user.uid,
//         receiverId: selectedUser.id,
//         senderName: user.fullName,
//         receiverName: selectedUser.fullName,
//         text: messageText,
//         timestamp: Timestamp.now(),
//         read: false
//       });
      
//       setMessageText("");
//     } catch (err) {
//       console.error("Error sending message:", err);
//       setError("Failed to send message. Please try again.");
//     } finally {
//       setSending(false);
//     }
//   };

//   const formatTime = (date) => {
//     if (!date) return "";
    
//     const hours = date.getHours();
//     const minutes = date.getMinutes();
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//   };
  
//   const formatDate = (date) => {
//     if (!date) return "";
    
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
    
//     if (date.toDateString() === today.toDateString()) {
//       return "Today";
//     } else if (date.toDateString() === yesterday.toDateString()) {
//       return "Yesterday";
//     } else {
//       return date.toLocaleDateString();
//     }
//   };
  
//   // Group messages by date
//   const groupMessagesByDate = () => {
//     const groups = {};
    
//     messages.forEach(message => {
//       if (!message.timestamp) return;
      
//       const dateStr = formatDate(message.timestamp);
//       if (!groups[dateStr]) {
//         groups[dateStr] = [];
//       }
      
//       groups[dateStr].push(message);
//     });
    
//     return groups;
//   };

//   return (
//     <div className="bg-white shadow-md rounded-lg p-6 flex flex-col h-[calc(100vh-11rem)]">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">Messages</h2>
      
//       {error && (
//         <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
//           {error}
//         </div>
//       )}
      
//       <div className="flex flex-1 overflow-hidden border border-gray-200 rounded-lg">
//         {/* Left sidebar - Contacts */}
//         <div className="w-1/4 border-r border-gray-200 flex flex-col bg-white">
//           <div className="p-3 border-b border-gray-200">
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaSearch className="text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search contacts..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
          
//           <div className="flex-1 overflow-y-auto">
//             {loading ? (
//               <div className="flex justify-center items-center h-full">
//                 <FaSpinner className="animate-spin text-blue-500" size={24} />
//               </div>
//             ) : staffMembers.length === 0 ? (
//               <div className="text-center p-6 text-gray-500">
//                 No contacts found
//               </div>
//             ) : (
//               <div>
//                 {staffMembers.map((member) => (
//                   <div
//                     key={member.id}
//                     onClick={() => setSelectedUser(member)}
//                     className={`p-3 flex items-start hover:bg-gray-50 cursor-pointer ${
//                       selectedUser?.id === member.id ? "bg-blue-50" : ""
//                     }`}
//                   >
//                     <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
//                       <FaUserCircle className="text-gray-500" size={24} />
//                     </div>
//                     <div className="ml-3 flex-1">
//                       <div className="text-sm font-medium text-gray-900">
//                         {member.fullName || "Unnamed"}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {member.position || "Staff"}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
        
//         {/* Right side - Chat */}
//         <div className="w-3/4 flex flex-col bg-gray-50">
//           {!selectedUser ? (
//             <div className="flex-1 flex items-center justify-center">
//               <div className="text-center text-gray-500">
//                 <div className="text-6xl mb-4">💬</div>
//                 <p>Select a contact to start messaging</p>
//               </div>
//             </div>
//           ) : (
//             <>
//               {/* Chat header */}
//               <div className="p-3 border-b border-gray-200 bg-white">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
//                     <FaUserCircle className="text-gray-500" size={24} />
//                   </div>
//                   <div className="ml-3">
//                     <div className="text-sm font-medium text-gray-900">
//                       {selectedUser.fullName || "Unnamed"}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {selectedUser.position || "Staff"} • {selectedUser.email}
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Chat messages */}
//               <div 
//                 ref={chatContainerRef}
//                 className="flex-1 overflow-y-auto p-4 space-y-4"
//               >
//                 {Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
//                   <div key={date}>
//                     <div className="flex justify-center my-4">
//                       <div className="bg-gray-200 text-gray-600 rounded-full px-3 py-1 text-xs">
//                         {date}
//                       </div>
//                     </div>
                    
//                     {dateMessages.map((message) => (
//                       <div
//                         key={message.id}
//                         className={`flex ${
//                           message.senderId === user.uid ? "justify-end" : "justify-start"
//                         }`}
//                       >
//                         <div
//                           className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
//                             message.senderId === user.uid
//                               ? "bg-blue-500 text-white"
//                               : "bg-white text-gray-800"
//                           }`}
//                         >
//                           <div className="text-sm">
//                             {message.text}
//                           </div>
//                           <div className="mt-1 text-right flex justify-end items-center space-x-1">
//                             <span className="text-xs opacity-75">
//                               {formatTime(message.timestamp)}
//                             </span>
//                             {message.senderId === user.uid && (
//                               <span>
//                                 {message.read ? (
//                                   <FaCheckDouble className="text-xs opacity-75" />
//                                 ) : (
//                                   <FaRegClock className="text-xs opacity-75" />
//                                 )}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ))}
                
//                 <div ref={messagesEndRef} />
//               </div>
              
//               {/* Message input */}
//               <div className="p-3 border-t border-gray-200 bg-white">
//                 <form onSubmit={handleSendMessage} className="flex">
//                   <input
//                     type="text"
//                     value={messageText}
//                     onChange={(e) => setMessageText(e.target.value)}
//                     placeholder="Type a message..."
//                     className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   <button
//                     type="submit"
//                     disabled={sending || !messageText.trim()}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//                   >
//                     {sending ? (
//                       <FaSpinner className="animate-spin" />
//                     ) : (
//                       <FaRegPaperPlane />
//                     )}
//                   </button>
//                 </form>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Messages;

import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  onSnapshot,
  Timestamp,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  FaRegPaperPlane,
  FaSpinner,
  FaRegClock,
  FaCheckDouble,
  FaSearch,
  FaUserCircle,
  FaUserTie,
  FaUserCog,
} from "react-icons/fa";

const Messages = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initial data load - fetch contacts based on user role
  useEffect(() => {
    if (!user) return;
    
    fetchContacts();
  }, [user]);
  
  // Set up listener for new messages when a user is selected
  useEffect(() => {
    if (!user || !selectedUser) return;
    
    const chatId = getChatId(user.uid, selectedUser.id);
    
    const messagesQuery = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messagesList = [];
      querySnapshot.forEach((doc) => {
        const messageData = {
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        };
        
        // Mark messages as read if they're from the other user
        if (messageData.senderId !== user.uid && !messageData.read) {
          updateDoc(doc.ref, { read: true });
        }
        
        messagesList.push(messageData);
      });
      
      setMessages(messagesList);
    });
    
    return () => unsubscribe();
  }, [user, selectedUser]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Filter contacts when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      fetchContacts();
      return;
    }
    
    const filtered = contacts.filter(contact => 
      contact.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setContacts(filtered);
  }, [searchTerm]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Get a unique chat ID for the conversation between two users
  const getChatId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  const fetchContacts = async () => {
    setLoading(true);
    setError("");
    
    try {
      let queryResult;
      
      // For admin: fetch all managers
      // For manager: fetch admin users
      // For staff: fetch the manager of their restaurant
      if (user.role === "admin") {
        const managerQuery = query(
          collection(db, "users"),
          where("role", "==", "manager")
        );
        queryResult = await getDocs(managerQuery);
      } else if (user.role === "manager") {
        // For managers, fetch all admins
        const adminQuery = query(
          collection(db, "users"),
          where("role", "==", "admin")
        );
        queryResult = await getDocs(adminQuery);
        
        // Also fetch all staff members under this manager
        const staffQuery = query(
          collection(db, "users"),
          where("restaurantId", "==", user.restaurantId || user.uid),
          where("role", "==", "staff")
        );
        const staffResult = await getDocs(staffQuery);
        
        // Combine both query results
        const adminContacts = [];
        queryResult.forEach((doc) => {
          adminContacts.push({
            id: doc.id,
            ...doc.data(),
            isAdmin: true // Flag to differentiate admins from staff
          });
        });
        
        const staffContacts = [];
        staffResult.forEach((doc) => {
          staffContacts.push({
            id: doc.id,
            ...doc.data(),
            isAdmin: false // Flag to differentiate staff from admins
          });
        });
        
        // Set combined contacts
        setContacts([...adminContacts, ...staffContacts]);
        setLoading(false);
        return;
      } else if (user.role === "staff") {
        // Find the manager based on restaurantId
        if (user.restaurantId) {
          const managerQuery = query(
            collection(db, "users"),
            where("restaurantId", "==", user.restaurantId),
            where("role", "==", "manager")
          );
          queryResult = await getDocs(managerQuery);
        } else {
          setContacts([]);
          setLoading(false);
          return;
        }
      }
      
      const contactsList = [];
      queryResult.forEach((doc) => {
        contactsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setContacts(contactsList);
      
      // Auto-select if there's only one option (for staff)
      if (contactsList.length === 1 && user.role === "staff") {
        setSelectedUser(contactsList[0]);
      }
      
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    if (!selectedUser) return;
    
    setSending(true);
    
    try {
      const chatId = getChatId(user.uid, selectedUser.id);
      
      await addDoc(collection(db, "messages"), {
        chatId: chatId,
        senderId: user.uid,
        receiverId: selectedUser.id,
        senderName: user.fullName,
        receiverName: selectedUser.fullName,
        text: messageText,
        timestamp: Timestamp.now(),
        read: false
      });
      
      setMessageText("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (date) => {
    if (!date) return "";
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      if (!message.timestamp) return;
      
      const dateStr = formatDate(message.timestamp);
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(message);
    });
    
    return groups;
  };
  
  // Get the appropriate icon for user role
  const getUserRoleIcon = (contact) => {
    if (contact.role === "admin") {
      return <FaUserCog className="text-indigo-500" size={24} />;
    } else if (contact.role === "manager") {
      return <FaUserTie className="text-green-500" size={24} />;
    } else {
      return <FaUserCircle className="text-blue-500" size={24} />;
    }
  };
  
  // Get contact display name with additional info
  const getContactDisplayInfo = (contact) => {
    let name = contact.fullName || "Unnamed";
    let subtitle = contact.role || "";
    
    if (contact.role === "manager" && contact.restaurantName) {
      subtitle += ` • ${contact.restaurantName}`;
    } else if (contact.role === "staff" && contact.position) {
      subtitle += ` • ${contact.position}`;
    }
    
    return { name, subtitle };
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col h-[calc(100vh-11rem)]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Messages</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden border border-gray-200 rounded-lg">
        {/* Left sidebar - Contacts */}
        <div className="w-1/4 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <FaSpinner className="animate-spin text-blue-500" size={24} />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center p-6 text-gray-500">
                No contacts found
              </div>
            ) : (
              <div>
                {/* Section for admins if user is manager */}
                {user.role === "manager" && contacts.some(contact => contact.isAdmin) && (
                  <div>
                    <div className="px-3 py-2 bg-gray-100 text-xs font-medium text-gray-500 uppercase">
                      Admins
                    </div>
                    {contacts.filter(contact => contact.isAdmin).map((contact) => {
                      const { name, subtitle } = getContactDisplayInfo(contact);
                      return (
                        <div
                          key={contact.id}
                          onClick={() => setSelectedUser(contact)}
                          className={`p-3 flex items-start hover:bg-gray-50 cursor-pointer ${
                            selectedUser?.id === contact.id ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {getUserRoleIcon(contact)}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subtitle}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Section for staff if user is manager */}
                {user.role === "manager" && contacts.some(contact => !contact.isAdmin) && (
                  <div>
                    <div className="px-3 py-2 bg-gray-100 text-xs font-medium text-gray-500 uppercase">
                      Staff
                    </div>
                    {contacts.filter(contact => !contact.isAdmin).map((contact) => {
                      const { name, subtitle } = getContactDisplayInfo(contact);
                      return (
                        <div
                          key={contact.id}
                          onClick={() => setSelectedUser(contact)}
                          className={`p-3 flex items-start hover:bg-gray-50 cursor-pointer ${
                            selectedUser?.id === contact.id ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {getUserRoleIcon(contact)}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subtitle}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* For admin and staff - no sections */}
                {user.role !== "manager" && contacts.map((contact) => {
                  const { name, subtitle } = getContactDisplayInfo(contact);
                  return (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedUser(contact)}
                      className={`p-3 flex items-start hover:bg-gray-50 cursor-pointer ${
                        selectedUser?.id === contact.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {getUserRoleIcon(contact)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {subtitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Chat */}
        <div className="w-3/4 flex flex-col bg-gray-50">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <p>Select a contact to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-3 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {getUserRoleIcon(selectedUser)}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {selectedUser.fullName || "Unnamed"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedUser.role === "manager" && selectedUser.restaurantName 
                        ? `${selectedUser.role} • ${selectedUser.restaurantName}`
                        : selectedUser.role}
                      {selectedUser.email ? ` • ${selectedUser.email}` : ""}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 text-gray-600 rounded-full px-3 py-1 text-xs">
                        {date}
                      </div>
                    </div>
                    
                    {dateMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user.uid ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                            message.senderId === user.uid
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-800"
                          }`}
                        >
                          <div className="text-sm">
                            {message.text}
                          </div>
                          <div className="mt-1 text-right flex justify-end items-center space-x-1">
                            <span className="text-xs opacity-75">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.senderId === user.uid && (
                              <span>
                                {message.read ? (
                                  <FaCheckDouble className="text-xs opacity-75" />
                                ) : (
                                  <FaRegClock className="text-xs opacity-75" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message input */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {sending ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaRegPaperPlane />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useFirestore } from '../../context/FirestoreContext';
// import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
// import { db } from "../../firebase"
// // import { updateFeedbackStatus } from "../../firestore"
// import Sidebar from '../../components/admin/Sidebase';
// import AdminHeader from '../../components/admin/AdminHeader';
// import FeedbackTable from '../../components/admin/FeedbackTable';

// const FeedbackManagement = () => {
//   const { currentUser, userRole } = useAuth();
//   const { feedbackEntries, refreshData } = useFirestore();
//   const [feedback, setFeedback] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedFeedback, setSelectedFeedback] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalType, setModalType] = useState(''); // 'view', 'respond'
//   const [responseText, setResponseText] = useState('');
  
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchFeedback = async () => {
//       if (userRole !== 'admin') return;
      
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         if (feedbackEntries && feedbackEntries.length > 0) {
//           setFeedback(feedbackEntries);
//           setIsLoading(false);
//         } else {
//           const feedbackQuery = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
//           const querySnapshot = await getDocs(feedbackQuery);
          
//           const fetchedFeedback = [];
//           querySnapshot.forEach((doc) => {
//             fetchedFeedback.push({
//               id: doc.id,
//               ...doc.data()
//             });
//           });
          
//           setFeedback(fetchedFeedback);
//           setIsLoading(false);
//         }
//       } catch (err) {
//         console.error("Error fetching feedback:", err);
//         setError("Failed to load feedback. Please try again.");
//         setIsLoading(false);
//       }
//     };
    
//     fetchFeedback();
//   }, [userRole, feedbackEntries]);

//   const handleViewDetails = (feedbackItem) => {
//     setSelectedFeedback(feedbackItem);
//     setModalType('view');
//     setIsModalOpen(true);
//   };

//   const handleRespond = (feedbackItem) => {
//     setSelectedFeedback(feedbackItem);
//     setResponseText(feedbackItem.response || '');
//     setModalType('respond');
//     setIsModalOpen(true);
//   };

//   const handleChangeStatus = async (feedbackItem, newStatus) => {
//     try {
//       setIsLoading(true);
//       await updateFeedbackStatus(feedbackItem.id, newStatus);
      
//       // Update local state
//       setFeedback(feedback.map(item => 
//         item.id === feedbackItem.id ? { ...item, status: newStatus } : item
//       ));
      
//       // Refresh data in context
//       refreshData();
      
//       setIsLoading(false);
//     } catch (err) {
//       console.error("Error updating feedback status:", err);
//       setError("Failed to update feedback status. Please try again.");
//       setIsLoading(false);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedFeedback(null);
//     setModalType('');
//     setResponseText('');
//   };

//   const handleSubmitResponse = async () => {
//     if (!selectedFeedback || !responseText.trim()) return;
    
//     try {
//       setIsLoading(true);
      
//       // Update feedback with response
//       await updateFeedbackStatus(selectedFeedback.id, 'responded', responseText);
      
//       // Update local state
//       setFeedback(feedback.map(item => 
//         item.id === selectedFeedback.id 
//           ? { 
//               ...item, 
//               status: 'responded', 
//               response: responseText,
//               respondedAt: serverTimestamp()
//             } 
//           : item
//       ));
      
//       // Refresh data in context
//       refreshData();
      
//       setIsLoading(false);
//       handleCloseModal();
//     } catch (err) {
//       console.error("Error responding to feedback:", err);
//       setError("Failed to submit response. Please try again.");
//       setIsLoading(false);
//     }
//   };

//   if (!currentUser || userRole !== 'admin') {
//     return (
//       <div className="min-h-screen bg-gray-100 flex flex-col">
//         <div className="flex-grow flex items-center justify-center">
//           <div className="text-center">
//             <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
//               Access Denied
//             </h2>
//             <p className="mt-4 text-lg text-gray-500">
//               You do not have permission to access this page.
//             </p>
//             <div className="mt-6">
//               <button
//                 onClick={() => navigate('/home')}
//                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//               >
//                 Back to Dashboard
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 flex">
//       {/* Sidebar */}
//       <Sidebar />
      
//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         <AdminHeader title="Feedback Management" />
        
//         <main className="flex-1 overflow-y-auto p-6">
//           {/* Page Header */}
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
//             <p className="mt-1 text-sm text-gray-500">
//               Review and respond to user feedback
//             </p>
//           </div>
          
//           {/* Error Display */}
//           {error && (
//             <div className="bg-red-50 p-4 rounded-md mb-6">
//               <div className="flex">
//                 <div className="flex-shrink-0">
//                   <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div className="ml-3">
//                   <h3 className="text-sm font-medium text-red-800">
//                     Error
//                   </h3>
//                   <div className="mt-2 text-sm text-red-700">
//                     <p>{error}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Statistics */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
//                   <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
//                   </svg>
//                 </div>
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       Total Feedback
//                     </dt>
//                     <dd>
//                       <div className="text-lg font-medium text-gray-900">
//                         {feedback.length}
//                       </div>
//                     </dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
//                   <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       Pending
//                     </dt>
//                     <dd>
//                       <div className="text-lg font-medium text-gray-900">
//                         {feedback.filter(item => item.status === 'pending').length}
//                       </div>
//                     </dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
//                   <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                   </svg>
//                 </div>
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       Reviewed
//                     </dt>
//                     <dd>
//                       <div className="text-lg font-medium text-gray-900">
//                         {feedback.filter(item => item.status === 'reviewed').length}
//                       </div>
//                     </dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
//                   <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                 </div>
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       Responded
//                     </dt>
//                     <dd>
//                       <div className="text-lg font-medium text-gray-900">
//                         {feedback.filter(item => item.status === 'responded').length}
//                       </div>
//                     </dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Loading State */}
//           {isLoading && !feedback.length ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//             </div>
//           ) : (
//             <div className="bg-white shadow rounded-lg p-6">
//               <FeedbackTable
//                 feedbackEntries={feedback}
//                 onRespond={handleRespond}
//                 onViewDetails={handleViewDetails}
//                 onChangeStatus={handleChangeStatus}
//               />
//             </div>
//           )}
//         </main>
//       </div>
      
//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed z-10 inset-0 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             {/* Background overlay */}
//             <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            
//             {/* Modal panel */}
//             <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
//               {modalType === 'view' && selectedFeedback && (
//                 <div>
//                   <div className="flex justify-between items-start">
//                     <h3 className="text-lg leading-6 font-medium text-gray-900">Feedback Details</h3>
//                     <button
//                       onClick={handleCloseModal}
//                       className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
//                     >
//                       <span className="sr-only">Close</span>
//                       <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>
//                   </div>
                  
//                   <div className="mt-5">
//                     <div className="flex items-center mb-4">
//                       <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-lg">
//                         {selectedFeedback.userName 
//                           ? selectedFeedback.userName.charAt(0).toUpperCase()
//                           : selectedFeedback.userEmail
//                           ? selectedFeedback.userEmail.charAt(0).toUpperCase()
//                           : 'U'}
//                       </div>
//                       <div className="ml-4">
//                         <h4 className="text-lg font-semibold text-gray-900">{selectedFeedback.userName || 'Anonymous User'}</h4>
//                         <p className="text-sm text-gray-500">{selectedFeedback.userEmail || 'No email provided'}</p>
//                       </div>
//                     </div>
                    
//                     {/* Feedback Type and Rating */}
//                     <div className="flex items-center mb-4">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                         selectedFeedback.feedbackType === 'feature'
//                           ? 'bg-indigo-100 text-indigo-800'
//                           : selectedFeedback.feedbackType === 'bug'
//                           ? 'bg-red-100 text-red-800'
//                           : selectedFeedback.feedbackType === 'suggestion'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}>
//                         {selectedFeedback.feedbackType 
//                           ? selectedFeedback.feedbackType.charAt(0).toUpperCase() + selectedFeedback.feedbackType.slice(1) 
//                           : 'General'}
//                       </span>
                      
//                       {selectedFeedback.rating && (
//                         <div className="ml-4 flex items-center">
//                           <span className="text-xs font-medium text-gray-500 mr-1">Rating:</span>
//                           <div className="flex items-center">
//                             {[1, 2, 3, 4, 5].map((star) => (
//                               <svg
//                                 key={star}
//                                 className={`h-4 w-4 ${
//                                   star <= selectedFeedback.rating ? 'text-yellow-400' : 'text-gray-300'
//                                 }`}
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 viewBox="0 0 20 20"
//                                 fill="currentColor"
//                               >
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                               </svg>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
                    
//                     {/* Status */}
//                     <div className="mb-4">
//                       <span className="text-xs font-medium text-gray-500 mr-2">Status:</span>
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                         selectedFeedback.status === 'pending'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : selectedFeedback.status === 'reviewed'
//                           ? 'bg-blue-100 text-blue-800'
//                           : selectedFeedback.status === 'responded'
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}>
//                         {selectedFeedback.status 
//                           ? selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1) 
//                           : 'Pending'}
//                       </span>
//                     </div>
                    
//                     {/* Date */}
//                     <div className="mb-4 text-xs text-gray-500">
//                       Submitted on: {selectedFeedback.createdAt 
//                         ? new Date(selectedFeedback.createdAt.toDate()).toLocaleString() 
//                         : 'N/A'}
//                     </div>
                    
//                     {/* Feedback Text */}
//                     <div className="mt-4">
//                       <h5 className="text-sm font-medium text-gray-700 mb-2">Feedback:</h5>
//                       <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
//                         {selectedFeedback.feedbackText || 'No feedback provided'}
//                       </p>
//                     </div>
                    
//                     {/* Response if available */}
//                     {selectedFeedback.response && (
//                       <div className="mt-4">
//                         <h5 className="text-sm font-medium text-gray-700 mb-2">Response:</h5>
//                         <div className="border-l-2 border-green-500 pl-4">
//                           <p className="text-sm text-gray-700">{selectedFeedback.response}</p>
//                           {selectedFeedback.respondedAt && (
//                             <p className="text-xs text-gray-500 mt-1">
//                               Responded on: {new Date(selectedFeedback.respondedAt.toDate()).toLocaleString()}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className="mt-6 flex justify-end space-x-3">
//                     <button
//                       type="button"
//                       className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-gray-300 rounded-md"
//                       onClick={handleCloseModal}
//                     >
//                       Close
//                     </button>
//                     {selectedFeedback.status !== 'responded' && (
//                       <button
//                         type="button"
//                         className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-transparent rounded-md"
//                         onClick={() => {
//                           handleCloseModal();
//                           handleRespond(selectedFeedback);
//                         }}
//                       >
//                         Respond
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}
              
//               {modalType === 'respond' && selectedFeedback && (
//                 <div>
//                   <div className="flex justify-between items-start">
//                     <h3 className="text-lg leading-6 font-medium text-gray-900">Respond to Feedback</h3>
//                     <button
//                       onClick={handleCloseModal}
//                       className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
//                     >
//                       <span className="sr-only">Close</span>
//                       <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>
//                   </div>
                  
//                   <div className="mt-5">
//                     {/* User info */}
//                     <div className="flex items-center mb-4">
//                       <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-lg">
//                         {selectedFeedback.userName 
//                           ? selectedFeedback.userName.charAt(0).toUpperCase()
//                           : selectedFeedback.userEmail
//                           ? selectedFeedback.userEmail.charAt(0).toUpperCase()
//                           : 'U'}
//                       </div>
//                       <div className="ml-3">
//                         <h4 className="text-sm font-medium text-gray-900">{selectedFeedback.userName || 'Anonymous User'}</h4>
//                         <p className="text-xs text-gray-500">{selectedFeedback.userEmail || 'No email provided'}</p>
//                       </div>
//                     </div>
                    
//                     {/* Feedback text */}
//                     <div className="mb-4">
//                       <h5 className="text-sm font-medium text-gray-700 mb-2">Original Feedback:</h5>
//                       <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
//                         {selectedFeedback.feedbackText || 'No feedback provided'}
//                       </p>
//                     </div>
                    
//                     {/* Response textarea */}
//                     <div>
//                       <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
//                         Your Response:
//                       </label>
//                       <textarea
//                         id="response"
//                         name="response"
//                         rows={5}
//                         className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                         placeholder="Enter your response to the user..."
//                         value={responseText}
//                         onChange={(e) => setResponseText(e.target.value)}
//                       ></textarea>
//                     </div>
//                   </div>
                  
//                   <div className="mt-6 flex justify-end space-x-3">
//                     <button
//                       type="button"
//                       className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-gray-300 rounded-md"
//                       onClick={handleCloseModal}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-transparent rounded-md"
//                       onClick={handleSubmitResponse}
//                       disabled={isLoading || !responseText.trim()}
//                     >
//                       {isLoading ? (
//                         <>
//                           <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                           </svg>
//                           Submitting...
//                         </>
//                       ) : (
//                         'Submit Response'
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FeedbackManagement;

import React from 'react'

const FeedbackManagement = () => {
  return (
    <div>FeedbackManagement</div>
  )
}

export default FeedbackManagement
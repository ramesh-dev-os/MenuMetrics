import React, { useState } from 'react';

const FeedbackTable = ({ feedbackEntries, onRespond, onViewDetails, onChangeStatus }) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter for status
  const filteredFeedback = feedbackEntries
    .filter(feedback => {
      // Apply status filter
      if (statusFilter !== 'all' && feedback.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      return (
        (feedback.userName && feedback.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (feedback.userEmail && feedback.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (feedback.feedbackText && feedback.feedbackText.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (feedback.feedbackType && feedback.feedbackType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });

  // Sort the filtered feedback
  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
      
      return sortDirection === 'asc' 
        ? dateA - dateB 
        : dateB - dateA;
    }
    
    if (a[sortField] < b[sortField]) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
        {/* Status filter buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              statusFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              statusFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              statusFilter === 'reviewed'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Reviewed
          </button>
          <button
            onClick={() => setStatusFilter('responded')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              statusFilter === 'responded'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Responded
          </button>
        </div>
        
        {/* Search */}
        <div className="w-full sm:w-64">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {sortedFeedback.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {sortedFeedback.map((feedback) => (
              <li key={feedback.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                  {/* Left side - User info and feedback type */}
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium">
                        {feedback.userName 
                          ? feedback.userName.charAt(0).toUpperCase() 
                          : feedback.userEmail
                          ? feedback.userEmail.charAt(0).toUpperCase()
                          : 'U'}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          {feedback.userName || 'Anonymous User'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {feedback.userEmail || 'No email provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        feedback.feedbackType === 'feature'
                          ? 'bg-indigo-100 text-indigo-800'
                          : feedback.feedbackType === 'bug'
                          ? 'bg-red-100 text-red-800'
                          : feedback.feedbackType === 'suggestion'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {feedback.feedbackType 
                          ? feedback.feedbackType.charAt(0).toUpperCase() + feedback.feedbackType.slice(1) 
                          : 'General'}
                      </span>
                      
                      {/* Rating if available */}
                      {feedback.rating && (
                        <div className="ml-3 flex items-center">
                          <span className="text-xs font-medium text-gray-500 mr-1">Rating:</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Date */}
                      <span className="ml-3 text-xs text-gray-500">
                        {feedback.createdAt 
                          ? new Date(feedback.createdAt.toDate()).toLocaleString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right side - Status and actions */}
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      feedback.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : feedback.status === 'reviewed'
                        ? 'bg-blue-100 text-blue-800'
                        : feedback.status === 'responded'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {feedback.status 
                        ? feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1) 
                        : 'Pending'}
                    </span>
                    
                    <div className="space-x-2">
                      <button
                        onClick={() => onViewDetails(feedback)}
                        className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200"
                      >
                        View
                      </button>
                      
                      <button
                        onClick={() => onRespond(feedback)}
                        className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                        disabled={feedback.status === 'responded'}
                      >
                        Respond
                      </button>
                      
                      {feedback.status !== 'reviewed' && feedback.status !== 'responded' && (
                        <button
                          onClick={() => onChangeStatus(feedback, 'reviewed')}
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                        >
                          Mark Reviewed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Feedback content */}
                <div className="mt-4">
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                    {feedback.feedbackText || 'No feedback provided'}
                  </p>
                  
                  {/* Response if available */}
                  {feedback.response && (
                    <div className="mt-3 ml-6 border-l-2 border-green-500 pl-4">
                      <p className="text-xs font-medium text-gray-500">Response:</p>
                      <p className="text-sm text-gray-700">{feedback.response}</p>
                      {feedback.respondedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(feedback.respondedAt.toDate()).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search or filter' 
                : 'No feedback has been submitted yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackTable;
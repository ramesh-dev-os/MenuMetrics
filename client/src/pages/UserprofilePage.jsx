import React, { useState } from 'react';

const UserprofilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@restaurant.com',
    phone: '(555) 123-4567',
    position: 'Executive Chef',
    restaurant: 'Coastal Cuisine',
    bio: 'Award-winning chef with 15+ years of experience in fine dining.',
    address: '123 Culinary Blvd, Foodie City, FC 98765',
    website: 'www.coastalcuisine.com',
    instagram: '@coastalchef',
    specialties: 'Seafood, Farm-to-Table, Mediterranean',
    yearsExperience: 15,
    awards: 'James Beard Rising Star Chef 2022',
    preferences: {
      darkMode: false,
      emailNotifications: true,
      smsNotifications: false,
      weeklyReports: true
    }
  });

  const [skills, setSkills] = useState([
    { name: 'Menu Development', level: 95 },
    { name: 'Inventory Management', level: 85 },
    { name: 'Staff Training', level: 90 },
    { name: 'Cost Control', level: 88 },
    { name: 'Plating & Presentation', level: 92 }
  ]);

  const [achievements, setAchievements] = useState([
    { year: '2022', title: 'James Beard Rising Star Chef' },
    { year: '2021', title: 'Featured in Food & Wine Magazine' },
    { year: '2020', title: '30 Under 30 Culinary Innovators' },
    { year: '2019', title: 'Regional Seafood Competition Winner' }
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefName = name.split('.')[1];
      setUserData({
        ...userData,
        preferences: {
          ...userData.preferences,
          [prefName]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setUserData({
        ...userData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving profile:', userData);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">MenuMetrics</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-green-600">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-green-600">Analytics</a>
            <a href="#" className="text-gray-600 hover:text-green-600">Menu</a>
            <a href="#" className="text-green-600 font-medium">Profile</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-sm font-medium text-green-700">{userData.firstName.charAt(0)}{userData.lastName.charAt(0)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="h-40 bg-gradient-to-r from-green-500 to-emerald-600 relative"></div>
          <div className="px-6 sm:px-10 pb-10 pt-0 relative">
            <div className="flex flex-col sm:flex-row -mt-20 mb-6 items-end sm:items-center">
              <img
                src="/api/placeholder/150/150"
                alt="Profile"
                className="h-32 w-32 rounded-xl border-4 border-white object-cover shadow-md"
              />
              <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-grow">
                <h2 className="text-3xl font-bold text-gray-900">{userData.firstName} {userData.lastName}</h2>
                <p className="text-lg text-gray-600">{userData.position} at {userData.restaurant}</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 sm:mt-0 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition shadow-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3 mt-4 sm:mt-0">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
            
            {/* Profile stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <span className="block text-2xl font-bold text-green-600">{userData.yearsExperience}</span>
                <span className="text-gray-600">Years Experience</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <span className="block text-2xl font-bold text-green-600">93%</span>
                <span className="text-gray-600">Menu Efficiency</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <span className="block text-2xl font-bold text-green-600">18%</span>
                <span className="text-gray-600">Waste Reduction</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <span className="block text-2xl font-bold text-green-600">4.8</span>
                <span className="text-gray-600">Rating</span>
              </div>
            </div>
            
            {/* Bio */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600">
                {userData.bio}
              </p>
            </div>
          </div>
        </div>
        
        {/* Section Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveSection('personal')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeSection === 'personal' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Personal Information
            </button>
            <button 
              onClick={() => setActiveSection('professional')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeSection === 'professional' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Professional Skills
            </button>
            <button 
              onClick={() => setActiveSection('achievements')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeSection === 'achievements' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Achievements
            </button>
            <button 
              onClick={() => setActiveSection('preferences')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeSection === 'preferences' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Preferences
            </button>
          </nav>
        </div>
        
        {/* Section Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            {activeSection === 'personal' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      disabled={!isEditing}
                      value={userData.firstName}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      disabled={!isEditing}
                      value={userData.lastName}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      disabled={!isEditing}
                      value={userData.email}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      disabled={!isEditing}
                      value={userData.phone}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      id="position"
                      disabled={!isEditing}
                      value={userData.position}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>

                  <div>
                    <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant
                    </label>
                    <input
                      type="text"
                      name="restaurant"
                      id="restaurant"
                      disabled={!isEditing}
                      value={userData.restaurant}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      disabled={!isEditing}
                      value={userData.address}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      id="website"
                      disabled={!isEditing}
                      value={userData.website}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      id="instagram"
                      disabled={!isEditing}
                      value={userData.instagram}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="specialties" className="block text-sm font-medium text-gray-700 mb-1">
                      Specialties
                    </label>
                    <input
                      type="text"
                      name="specialties"
                      id="specialties"
                      disabled={!isEditing}
                      value={userData.specialties}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      disabled={!isEditing}
                      value={userData.bio}
                      onChange={handleChange}
                      className={`block w-full rounded-lg ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3`}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Professional Skills */}
            {activeSection === 'professional' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Skills</h3>
                
                <div className="space-y-6">
                  {skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                        <span className="text-sm font-medium text-gray-700">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  {isEditing && (
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add New Skill
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Achievements */}
            {activeSection === 'achievements' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements & Awards</h3>
                
                <div className="relative pl-8 border-l-2 border-green-200 space-y-10">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-10 top-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-green-600 font-medium">{achievement.year}</p>
                        {isEditing && (
                          <button type="button" className="text-red-500 text-sm hover:text-red-700 mt-1">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isEditing && (
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add New Achievement
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Preferences */}
            {activeSection === 'preferences' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Preferences</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="darkMode"
                        name="preferences.darkMode"
                        type="checkbox"
                        disabled={!isEditing}
                        checked={userData.preferences.darkMode}
                        onChange={handleChange}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="darkMode" className="font-medium text-gray-700">Dark Mode</label>
                      <p className="text-gray-500">Use dark theme for the application</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="emailNotif"
                        name="preferences.emailNotifications"
                        type="checkbox"
                        disabled={!isEditing}
                        checked={userData.preferences.emailNotifications}
                        onChange={handleChange}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="emailNotif" className="font-medium text-gray-700">Email Notifications</label>
                      <p className="text-gray-500">Receive updates and alerts via email</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="smsNotif"
                        name="preferences.smsNotifications"
                        type="checkbox"
                        disabled={!isEditing}
                        checked={userData.preferences.smsNotifications}
                        onChange={handleChange}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="smsNotif" className="font-medium text-gray-700">SMS Notifications</label>
                      <p className="text-gray-500">Receive time-sensitive alerts via text message</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="weeklyReports"
                        name="preferences.weeklyReports"
                        type="checkbox"
                        disabled={!isEditing}
                        checked={userData.preferences.weeklyReports}
                        onChange={handleChange}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="weeklyReports" className="font-medium text-gray-700">Weekly Reports</label>
                      <p className="text-gray-500">Receive weekly performance and analytics reports</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      className="text-red-600 font-medium hover:text-red-800"
                      disabled={!isEditing}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserprofilePage;
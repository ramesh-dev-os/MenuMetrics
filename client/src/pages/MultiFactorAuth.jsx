import React, { useState, useEffect, useRef } from 'react';

const MultiFactorAuth = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes countdown
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // Format remaining time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Handle input change
  const handleChange = (index, e) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Update the OTP state
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Only take the first character
    setOtp(newOtp);
    
    // Clear any previous error
    if (error) setError('');
    
    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle key press
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedData = text.trim();
        if (/^\d+$/.test(pastedData)) {
          const digits = pastedData.split('').slice(0, 6);
          const newOtp = [...otp];
          
          digits.forEach((digit, i) => {
            if (i < 6) newOtp[i] = digit;
          });
          
          setOtp(newOtp);
          
          // Focus the appropriate field after paste
          if (digits.length < 6) {
            inputRefs.current[digits.length].focus();
          } else {
            inputRefs.current[5].focus();
          }
        }
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    
    // Validate if OTP is complete
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call to validate OTP
    setTimeout(() => {
      // For demo, we'll consider "123456" as valid OTP
      if (otpValue === '123456') {
        // Success! Redirect to dashboard or next step
        console.log('OTP verified successfully!');
        // Redirect would go here
      } else {
        setError('Invalid verification code. Please try again.');
        setIsSubmitting(false);
      }
    }, 1500);
  };

  // Request new OTP
  const handleResendOtp = () => {
    // Simulate API call to resend OTP
    setTimeLeft(120); // Reset timer
    setError('');
    
    // Simulate OTP resend
    setTimeout(() => {
      console.log('New OTP sent');
      // You would typically show a success message here
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verification Required</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to your email
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            j****@restaurant.com
          </p>
        </div>
        
        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter verification code
            </label>
            <div className="flex justify-between items-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  className="w-12 h-12 border-gray-300 rounded-md text-center text-xl font-semibold focus:ring-green-500 focus:border-green-500"
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  required
                />
              ))}
            </div>
            
            {error && (
              <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
            )}
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {timeLeft > 0 ? (
                  <>Code expires in <span className="font-medium">{formatTime(timeLeft)}</span></>
                ) : (
                  <>Code expired</>
                )}
              </p>
            </div>
          </div>
          
          {/* Verify Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || timeLeft <= 0}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </div>
          
          {/* Resend Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive a code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timeLeft > 0}
                className={`font-medium ${
                  timeLeft > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-green-600 hover:text-green-500'
                }`}
              >
                Send a new code
              </button>
            </p>
          </div>
          
          {/* Back to Login */}
          <div className="text-center">
            <a href="#" className="text-sm font-medium text-green-600 hover:text-green-500">
              Back to login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiFactorAuth;
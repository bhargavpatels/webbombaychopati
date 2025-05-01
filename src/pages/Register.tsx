import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/hooks/useUser';
import { navigateBack } from '@/utils/navigationUtils';
import { fetchPrivacyPolicy, fetchTermsConditions } from '@/services/contentService';
import LegalDocumentModal from '@/components/LegalDocumentModal';

const Register = () => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for agreements
  const [privacyPolicyChecked, setPrivacyPolicyChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  
  // Modal states
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [privacyContent, setPrivacyContent] = useState('');
  const [termsContent, setTermsContent] = useState('');
  
  // Validation state
  const [phoneError, setPhoneError] = useState('');
  const [phoneHelperText, setPhoneHelperText] = useState('');
  
  const { register } = useUser();
  const navigate = useNavigate();

  // Function to show privacy policy modal
  const handleShowPrivacyPolicy = async () => {
    if (!privacyContent) {
      try {
        const content = await fetchPrivacyPolicy();
        setPrivacyContent(content);
      } catch (error) {
        toast.error('Failed to load Privacy Policy');
        return;
      }
    }
    setShowPrivacyModal(true);
  };

  // Function to show terms modal
  const handleShowTerms = async () => {
    if (!termsContent) {
      try {
        const content = await fetchTermsConditions();
        setTermsContent(content);
      } catch (error) {
        toast.error('Failed to load Terms & Conditions');
        return;
      }
    }
    setShowTermsModal(true);
  };

  // Validate phone number when it changes
  useEffect(() => {
    validatePhone(phone);
  }, [phone]);
  
  // Function to validate Indian mobile numbers
  const validatePhone = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    if (!digits) {
      setPhoneError('');
      setPhoneHelperText('Enter your 10-digit mobile number');
      return false;
    }
    
    // Check if the number starts with a valid Indian mobile prefix
    const validStart = /^[6-9]/.test(digits);
    
    if (digits.length < 10) {
      setPhoneError(validStart ? '' : 'Number must start with 6, 7, 8, or 9');
      setPhoneHelperText(`${10 - digits.length} more digit${10 - digits.length === 1 ? '' : 's'} needed`);
      return false;
    } else if (digits.length > 10) {
      setPhoneError('Number must be exactly 10 digits');
      setPhoneHelperText('Remove extra digits');
      return false;
    } else if (!validStart) {
      setPhoneError('Must start with 6, 7, 8, or 9');
      setPhoneHelperText('Valid Indian mobile numbers only');
      return false;
    }
    
    // Valid number
    setPhoneError('');
    setPhoneHelperText('Valid mobile number');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privacyPolicyChecked || !termsChecked) {
      toast.error("Please accept both Privacy Policy and Terms & Conditions");
      return;
    }

    // Validate phone
    if (!validatePhone(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await register(name, email, phone, password);
      
      if (success) {
        // Redirect to login page after successful registration
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBackClick = () => {
    navigateBack(navigate);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex-grow flex flex-col items-center justify-center p-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handleBackClick}
              className="p-2 text-gray-500 hover:text-brand-pink"
            >
              <ArrowLeft size={24} />
            </button>
            
            <img 
              src="/lovable-uploads/e9e827c1-8756-4c5d-9c09-b3a33099bd3b.png" 
              alt="Shri Bombay Chowpati" 
              className="h-12 object-contain"
            />
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Auth Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <Link to="/login" className="flex-1 text-center py-3 text-gray-500 hover:text-gray-700">
                Login
              </Link>
              <div className="flex-1 text-center py-3 border-b-2 border-brand-pink font-medium text-brand-pink">
                Sign Up
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent bg-gray-50"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent bg-gray-50"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => {
                      // Only allow numeric characters
                      const numericValue = e.target.value.replace(/\D/g, '');
                      setPhone(numericValue);
                    }}
                    className={`w-full pl-10 py-3 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${phoneError ? 'focus:ring-red-500' : 'focus:ring-brand-pink'} focus:border-transparent bg-gray-50`}
                    placeholder="Enter your 10-digit mobile number"
                    maxLength={10}
                    inputMode="numeric" 
                    pattern="[0-9]*"
                    required
                  />
                </div>
                <div className={`mt-1 text-sm ${phoneError ? 'text-red-500' : 'text-gray-500'}`}>
                  {phoneError || phoneHelperText}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent bg-gray-50"
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent bg-gray-50"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Legal Agreements Section */}
              <div className="mb-6 space-y-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="privacyPolicy"
                    checked={privacyPolicyChecked}
                    onChange={(e) => setPrivacyPolicyChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-pink focus:ring-brand-pink"
                  />
                  <label htmlFor="privacyPolicy" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={handleShowPrivacyPolicy}
                      className="text-brand-pink hover:text-brand-pink-dark underline font-medium"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsChecked}
                    onChange={(e) => setTermsChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-pink focus:ring-brand-pink"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={handleShowTerms}
                      className="text-brand-pink hover:text-brand-pink-dark underline font-medium"
                    >
                      Terms & Conditions
                    </button>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !privacyPolicyChecked || !termsChecked}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition-colors
                  ${(privacyPolicyChecked && termsChecked) 
                    ? 'bg-brand-pink text-white hover:bg-opacity-90' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <LegalDocumentModal
        title="Privacy Policy"
        content={privacyContent}
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      
      <LegalDocumentModal
        title="Terms & Conditions"
        content={termsContent}
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      
      <Footer />
    </div>
  );
};

export default Register;




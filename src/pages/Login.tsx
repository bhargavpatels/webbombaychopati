import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { navigateBack } from '@/utils/navigationUtils';

  
const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(identifier, password);
      if (success) {
        // Check if we came from order history page
        const fromOrderHistory = location.pathname === '/order-history' || 
                               location.state?.from === '/order-history';
        
        if (fromOrderHistory) {
          navigate('/order-history', { 
            replace: true,
            state: { fromLogin: true }
          });
        } else {
          navigate('/products');
        }
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
              <div className="flex-1 text-center py-3 border-b-2 border-brand-pink font-medium text-brand-pink">
                Login
              </div>
              <Link to="/register" className="flex-1 text-center py-3 text-gray-500 hover:text-gray-700">
                Sign Up
              </Link>
            </div>
            
            <form onSubmit={handleSubmit}>
            <div className="mb-4">
  <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
    Email / Phone
  </label>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {/^\d{10}$/.test(identifier) ? (
        <Phone size={18} className="text-gray-400" />
      ) : (
        <Mail size={18} className="text-gray-400" />
      )}
    </div>
    <input
      type="text"
      id="identifier"
      value={identifier}
      onChange={(e) => {
        const value = e.target.value;

        // If only digits, limit to 10
        if (/^\d+$/.test(value)) {
          setIdentifier(value.slice(0, 10));
        } else {
          setIdentifier(value); // Allow all characters
        }
      }}
      className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent bg-gray-50"
      placeholder="Enter your email or phone"
      required
    />
  </div>

  {/* Validation message */}
  {identifier && !/^\d{10}$/.test(identifier) && !identifier.includes('@') && (
    <p className="text-red-500 text-sm mt-1">Please enter a valid email address (must include "@").</p>
  )}
</div>

              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-brand-pink hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent bg-gray-50"
                    placeholder="Enter your password"
                    required
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
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
              
              
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;

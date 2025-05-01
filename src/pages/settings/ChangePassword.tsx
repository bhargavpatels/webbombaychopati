import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Eye, EyeOff, Save } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/hooks/useUser';
import { navigateBack } from '@/utils/navigationUtils';
import { ApiUrls, ApiKeys } from '@/config/api-config';

const ChangePassword = () => {
  const { user, changePassword } = useUser();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleBack = () => {
    navigateBack(navigate, '/profile');
  };
  
  const verifyCurrentPassword = async (password: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        return false;
      }

      if (!user?.phone) {
        console.error('No user phone number found');
        return false;
      }

      const response = await fetch(`/api/${ApiUrls.login}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [ApiKeys.userId]: user.phone,
          [ApiKeys.password]: password
        })
      });

      const data = await response.json();
      
      // Check for various success indicators in the response
      const isSuccess = response.ok && (
        data.code === '200' || 
        data.success === true || 
        data.status === 'success' || 
        data.msg?.toLowerCase().includes('success') ||
        data.message?.toLowerCase().includes('success')
      );
      
      return isSuccess;
    } catch (error) {
      console.error('Error verifying current password:', error);
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First verify the current password
      const isCurrentPasswordValid = await verifyCurrentPassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        toast.error("Current password is incorrect. Please try again.");
        return;
      }
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        navigate('/login');
        return;
      }
      
      const response = await fetch('/api/changePassword.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword
        })
      });

      const data = await response.json();
      
      if (data.status === 'success' || data.code === '200' || data.msg === 'Password Changed Successfully' || data.msg === 'Password Change Successfully') {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success("Password changed successfully");
        navigate('/profile', { replace: true });
      } else {
        toast.error(data.message || data.msg || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("An error occurred while changing password");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-pattern">
      <Header />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-semibold ml-2">Change Password</h1>
          </div>
          
          <div className="bg-white rounded-xl p-6 max-w-md mx-auto border 5">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
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
                className="w-full py-3 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70"
              >
                <Save size={18} className="inline mr-2" />
                {isSubmitting ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChangePassword;


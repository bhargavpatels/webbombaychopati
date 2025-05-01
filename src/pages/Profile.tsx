import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, UserPlus, Settings, MapPin, Key, LogOut, Trash2, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/hooks/useUser';
import { navigateBack, navigateToSettingsPage } from '@/utils/navigationUtils';

const Profile = () => {
  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    toast.error("Please login to access your profile");
    return <Navigate to="/login" />;
  }

  // Handle back navigation
  const handleBackClick = () => {
    navigateBack(navigate);
  };

  return (
    <div className="flex flex-col min-h-screen bg-pattern">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBackClick} 
              className="mr-4 text-gray-500 hover:text-brand-pink transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>
          
          {/* User Info Card */}
          <div className="bg-white rounded-xl p-6 mb-6 border 5">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-brand-pink flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-gray-600">{user?.phone}</p>
              </div>
            </div>
          </div>
          
          {/* Settings Menu */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border 5">
            <h2 className="text-lg font-semibold p-4 border-b border-gray-20">Account Settings</h2>
            
            <div className="divide-y divide-gray-20">
              <ProfileMenuItem 
                icon={<User size={20} className="text-brand-pink" />}
                title="Personal Details"
                onClick={() => navigateToSettingsPage(navigate, '/settings/personal-details')}
              />
              
              <ProfileMenuItem 
                icon={<Key size={20} className="text-brand-pink" />}
                title="Change Password"
                onClick={() => navigateToSettingsPage(navigate, '/settings/change-password')}
              />
              
              <ProfileMenuItem 
                icon={<MapPin size={20} className="text-brand-pink" />}
                title="Manage Addresses"
                onClick={() => navigateToSettingsPage(navigate, '/settings/addresses')}
              />
            </div>
          </div>
          
          {/* Legal Menu */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border 5">
            <h2 className="text-lg font-semibold p-4 border-b border-gray-20">Legal</h2>
            
            <div className="divide-y divide-gray-20">
              <ProfileMenuItem 
                icon={<Settings size={20} className="text-gray-600" />}
                title="Privacy Policy"
                onClick={() => navigateToSettingsPage(navigate, '/privacy-policy')}
              />
              
              <ProfileMenuItem 
                icon={<Settings size={20} className="text-gray-600" />}
                title="Terms & Conditions"
                onClick={() => navigateToSettingsPage(navigate, '/terms')}
              />
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border 5">
            <h2 className="text-lg font-semibold p-4 border-b border-gray-20 text-red-500">Danger Zone</h2>
            
            <div className="divide-y divide-gray-20">
              <ProfileMenuItem 
                icon={<Trash2 size={20} className="text-red-500" />}
                title="Delete Account"
                onClick={() => navigateToSettingsPage(navigate, '/settings/delete-account')}
                danger
              />
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              navigate('/', { replace: true });
              toast.success("Logged out successfully");
            }}
            className="w-full py-3 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center mb-6"
          >
            <LogOut size={18} className="mr-2" />
            Log Out
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Helper component for menu items
const ProfileMenuItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, title, onClick, danger = false }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-gray-50 ${
        danger ? 'text-red-500' : ''
      }`}
    >
      <div className="flex items-center">
        {icon}
        <span className="ml-3">{title}</span>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </button>
  );
};

export default Profile;

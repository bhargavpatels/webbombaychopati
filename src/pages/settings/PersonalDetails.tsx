import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User as UserIcon, Mail, Phone } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/hooks/useUser';
import { navigateBack } from '@/utils/navigationUtils';
import type { User } from '@/types/user';

const PersonalDetails = () => {
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleBack = () => {
    navigateBack(navigate, '/profile');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      const trimmedPhone = phone.trim();

      // Validation
      if (!trimmedName || !trimmedEmail || !trimmedPhone) {
        toast.error("All fields are required");
        return;
      }

      // Only update if name has changed
      if (trimmedName === user?.name) {
        toast.info("No changes to update");
        return;
      }

      await updateProfile({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone
      });

      // Navigate after successful update
      navigate('/profile', { replace: true });
      
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile. Please try again.");
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
              className="mr-4 text-gray-500 hover:text-brand-pink transition-colors"
              type="button"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-brand-pink">Personal Details</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Note: Email and phone number can only be updated through customer support.
                You can update your display name below.
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Update Name"}
              </button>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PersonalDetails;
















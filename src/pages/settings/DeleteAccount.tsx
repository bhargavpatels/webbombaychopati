import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/hooks/useUser';
import { navigateBack } from '@/utils/navigationUtils';

const DeleteAccount = () => {
  const { deleteAccount } = useUser();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => {
    navigateBack(navigate, '/profile');
  };

  const handleRequestDelete = () => {
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const success = await deleteAccount();
    setIsDeleting(false);

    if (success) {
      navigate('/', { replace: true });
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
            <h1 className="text-2xl font-bold text-red-500">Delete Account</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start mb-4">
              <AlertTriangle size={24} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold mb-2">Warning: This action cannot be undone</h2>
                <p className="text-gray-600">
                  Deleting your account will permanently remove all your personal information, saved addresses, and order history from our system.
                </p>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <p className="text-red-600 text-sm">
                After deleting your account, you will need to register again if you wish to use the service in the future.
              </p>
            </div>

            <button
              onClick={handleRequestDelete}
              className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              <Trash2 size={18} className="mr-2" />
              Delete My Account
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Are you sure, you want to delete your account?
              </h3>
              <p className="text-gray-600">
                After it you will lose your account data.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCancelDelete}
                className="py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-70"
              >
                No
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-70"
              >
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DeleteAccount;


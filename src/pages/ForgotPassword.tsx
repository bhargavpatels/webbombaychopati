import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ForgotPassword = () => {
  return (
    <div className="flex flex-col min-h-screen bg-pattern">
      <Header />
      
      <main className="flex-grow flex items-start justify-center p-4 pt-20 pb-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <img 
              src="/lovable-uploads/splash_image.png" 
              alt="Shri Bombay Chowpati" 
              className="mx-auto object-contain"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-8">Contact Us</h1>
            
            <div className="space-y-8">
              {/* Phone */}
              <div className="flex flex-col bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-1">
                  <Phone className="w-5 h-5 text-brand-pink mr-2" />
                  <span className="font-medium">Call Us</span>
                </div>
                <a href="tel:+917600772446" className="text-brand-pink pl-7">
                  +91 7600 772 446
                </a>
              </div>

              {/* Email */}
              <div className="flex flex-col bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-1">
                  <Mail className="w-5 h-5 text-brand-pink mr-2" />
                  <span className="font-medium">Email Us</span>
                </div>
                <a href="mailto:shreebombaychowpati@gmail.com" className="text-brand-pink pl-7 break-all">
                  shreebombaychowpati@gmail.com
                </a>
              </div>

              {/* Address */}
              <div className="flex flex-col bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-1">
                  <MapPin className="w-5 h-5 text-brand-pink mr-2" />
                  <span className="font-medium">Visit Us</span>
                </div>
                <div className="pl-7 text-gray-600">
                  Shri Bombay Chowpati,<br />
                  Gauridad, Morbi Road,<br />
                  Rajkot, Gujarat
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex flex-col bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-1">
                  <Clock className="w-5 h-5 text-brand-pink mr-2" />
                  <span className="font-medium">Business Hours</span>
                </div>
                <div className="pl-7 text-gray-600">
                  10:00 AM - 10:00 PM
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link to="/login" className="text-brand-pink">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;

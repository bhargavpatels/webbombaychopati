import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  UserIcon, 
  CogIcon, 
  ScaleIcon,
  ShoppingBagIcon,
  ClockIcon,
  KeyIcon,
  UserPlusIcon,
  LockClosedIcon,
  UserCircleIcon,
  LanguageIcon,
  MapPinIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Sitemap = () => {
  const siteStructure = [
    {
      title: 'Main Pages',
      icon: <HomeIcon className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-brand-pink to-red-400',
      links: [
        { path: '/', label: 'Home', icon: <HomeIcon className="w-4 h-4" /> },
        { path: '/products', label: 'Products', icon: <ShoppingBagIcon className="w-4 h-4" /> },
        { path: '/cart', label: 'Cart', icon: <ShoppingCartIcon className="w-4 h-4" /> },
        { label: 'Order History', icon: <ClockIcon className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Account',
      icon: <UserIcon className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-brand-blue to-blue-400',
      links: [
        { path: '/login', label: 'Login', icon: <KeyIcon className="w-4 h-4" /> },
        { path: '/register', label: 'Register', icon: <UserPlusIcon className="w-4 h-4" /> },
        { label: 'Forgot Password', icon: <LockClosedIcon className="w-4 h-4" /> },
        { label: 'Profile', icon: <UserCircleIcon className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Settings',
      icon: <CogIcon className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-brand-purple to-purple-400',
      links: [
        { label: 'Personal Details', icon: <UserIcon className="w-4 h-4" /> },
        { label: 'Change Password', icon: <KeyIcon className="w-4 h-4" /> },
        { label: 'Addresses', icon: <MapPinIcon className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Legal',
      icon: <ScaleIcon className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-brand-teal to-teal-400',
      links: [
        { path: '/privacy-policy', label: 'Privacy Policy', icon: <ShieldCheckIcon className="w-4 h-4" /> },
        { path: '/terms', label: 'Terms & Conditions', icon: <DocumentTextIcon className="w-4 h-4" /> },
      ]
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-pattern">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Site Navigation</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore all sections of our website through this comprehensive sitemap
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {siteStructure.map((section, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`${section.color} p-6 flex items-center gap-3 text-white`}>
                  {section.icon}
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <ul className="p-6 space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.path}
                        className="flex items-center gap-3 text-gray-600 hover:text-brand-pink transition-colors p-2 rounded-lg hover:bg-pink-50 group"
                      >
                        <span className="text-gray-400 group-hover:text-brand-pink transition-colors">
                          {link.icon}
                        </span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Quick Search Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Can't find what you're looking for?</h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-pink text-white rounded-full font-medium hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Browse Our Products
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Sitemap;

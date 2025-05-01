import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Home, History, Search, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/hooks/useUser';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, user } = useUser();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2 glass-effect shadow-md' : 'py-4 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center"
          >
            <img 
              src="/lovable-uploads/e9e827c1-8756-4c5d-9c09-b3a33099bd3b.png" 
              alt="Shri Bombay Chowpati" 
              className="h-10 md:h-12 object-contain animate-fade-in"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" icon={<Home size={18} />}>Home</NavLink>
            <NavLink to="/products" icon={<Search size={18} />}>Products</NavLink>
            {isAuthenticated && (
              <NavLink to="/order-history" icon={<History size={18} />}>Orders</NavLink>
            )}
            {isAuthenticated ? (
              <NavLink to="/profile" icon={<User size={18} />}>
                {user?.name ? user.name.split(' ')[0] : 'Profile'}
              </NavLink>
            ) : (
              <NavLink to="/login" icon={<User size={18} />}>Login</NavLink>
            )}
            
            <Link 
              to="/cart" 
              className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-brand-pink text-white hover:bg-opacity-90 transition-all"
            >
              <ShoppingCart size={20} />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-white text-brand-pink text-xs font-bold rounded-full border-2 border-brand-pink animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="flex items-center md:hidden">
            <Link 
              to="/cart" 
              className="relative mr-4"
            >
              <ShoppingCart size={24} className="text-brand-pink" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-brand-pink text-white text-xs font-bold rounded-full animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none"
            >
              {isMenuOpen ? (
                <X size={24} className="text-brand-pink" />
              ) : (
                <Menu size={24} className="text-brand-pink" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-effect border-t mt-2 animate-fade-in">
          <nav className="flex flex-col py-4">
            <MobileNavLink to="/" icon={<Home size={18} />}>Home</MobileNavLink>
            <MobileNavLink to="/products" icon={<Search size={18} />}>Products</MobileNavLink>
            {isAuthenticated && (
              <MobileNavLink to="/order-history" icon={<History size={18} />}>Orders</MobileNavLink>
            )}
            {isAuthenticated ? (
              <MobileNavLink to="/profile" icon={<User size={18} />}>Profile</MobileNavLink>
            ) : (
              <MobileNavLink to="/login" icon={<User size={18} />}>Login</MobileNavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

const NavLink: React.FC<{ to: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ 
  to, 
  children,
  icon
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
        isActive 
          ? 'bg-brand-pink text-white font-medium' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

const MobileNavLink: React.FC<{ to: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ 
  to, 
  children,
  icon
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-6 py-3 border-b border-gray-100 ${
        isActive 
          ? 'text-brand-pink font-medium' 
          : 'text-gray-700'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

export default Header;


import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <img 
            src="/lovable-uploads/e9e827c1-8756-4c5d-9c09-b3a33099bd3b.png" 
            alt="Shri Bombay Chowpati" 
            className="h-20 object-contain mx-auto mb-6"
          />
          <h1 className="text-6xl font-bold text-brand-pink mb-2">404</h1>
          <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>
          <p className="text-gray-500 mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/" 
            className="w-full sm:w-auto px-6 py-3 bg-brand-pink text-white rounded-full font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
          >
            <Home size={18} className="mr-2" />
            Back to Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 bg-white text-gray-800 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

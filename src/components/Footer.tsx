import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 pt-12 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-8 mb-8">

          <div>
            <Link to="/" className="inline-block mb-4 w-full text-center sm:text-left">
              <img
                src="/lovable-uploads/splash_image.png"
                alt="Shri Bombay Chowpati"
                className="h-40 object-contain mx-auto sm:mx-0"
              />
            </Link>
            <p className="text-gray-600 mb-4">
              Enjoy the best ice cream in Rajkot delivered straight to your doorstep. Quality and taste in every bite.
            </p>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Download Our App</h3>
              <div className="flex flex-row space-x-3">
                <a
                  href="https://apps.apple.com/app/bombaychowpati/id6560114187"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#000000] text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-white/80">Download now</span>
                    <span className="text-sm font-medium">App Store</span>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.order.bombaychowpati"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#000000] text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <svg className="w-6 h-6" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-white/80">Download now</span>
                    <span className="text-sm font-medium">Play Store</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-brand-pink transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-brand-pink transition-colors">Products</Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-brand-pink transition-colors">Cart</Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-gray-600 hover:text-brand-pink transition-colors">Sitemap</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-brand-pink mt-1 mr-2 flex-shrink-0" />
                <div className="text-gray-600 flex flex-col">
                  <span>Shri Bombay Chowpati,</span>
                  <span>Gauridad, Morbi Road,</span>
                  <span>Rajkot, Gujarat</span>
                </div>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-brand-pink mr-2 flex-shrink-0" />
                <a href="tel:+917600772446" className="text-gray-600 hover:text-brand-pink transition-colors">+91 7600 772 446</a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-brand-pink mr-2 flex-shrink-0" />
                <a
                  href="mailto:shreebombaychowpati@gmail.com"
                  className="text-gray-600 hover:text-brand-pink transition-colors break-all"
                >
                  shreebombaychowpati@gmail.com
                </a>

              </li>
              <li className="flex items-center">
                <Globe size={18} className="text-brand-pink mr-2 flex-shrink-0" />
                <a href="https://shribombaychowpati.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-pink transition-colors break-all">shribombaychowpati.com</a>
              </li>
              <li className="flex items-center">
                <Clock size={18} className="text-brand-pink mr-2 flex-shrink-0" />
                <span className="text-gray-600">10:00 AM - 10:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} Shri Bombay Chowpati Ice Cream. All rights reserved.</p>
          <p className="mt-1">Owner: SATYA NARAYAN JAT</p>
          <p className="mt-1">Developed by <a href="https://mindwaveinfoway.com/" target="_blank" rel="noopener noreferrer" className="text-brand-pink">Mindewave Infoway</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;







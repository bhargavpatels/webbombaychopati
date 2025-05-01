import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, IceCream, Truck, ThumbsUp, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/productApi';

const Index = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const featuredProducts = products.slice(0, 4);
  const navigate = useNavigate();

  const handleTrackOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/order-history', { replace: true });
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-pattern overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
  <div className="container mx-auto px-4 flex flex-col items-center justify-center relative z-10">
    <div className="w-full max-w-3xl mx-auto text-center">
      <div className="mb-8 animate-fade-in delay-100">
        <img
          src="/lovable-uploads/splash_image.png"
          alt="Bombay Chowpati Ice Cream"
          className="w-full max-w-xs md:max-w-md mx-auto object-contain"
        />
      </div>

      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
        <span className="block text-brand-pink">Delicious Ice Cream</span>
        <span className="text-gray-500 text-2xl md:text-2xl lg:text-3xl block">Delivered to Your Door</span>
      </h1>

      <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-in delay-100">
        Experience the best ice cream flavors in Rajkot with our quick and reliable delivery service.
      </p>

      {/* App Store Links */}
      <div className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-in delay-100">
        <span>We're also available on: </span>
        <a
          href="https://play.google.com/store/apps/details?id=com.order.bombaychowpati"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-pink hover:underline inline-block"
        >
          Play Store
        </a>
        <span className="px-1"> & </span>
        <a
          href="https://apps.apple.com/app/bombaychowpati/id6560114187"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-pink hover:underline inline-block"
        >
          App Store
        </a>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-200">
        <Link
          to="/products"
          className="px-8 py-3 bg-brand-pink text-white rounded-full font-medium hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Browse Flavors
        </Link>

        <button
          onClick={handleTrackOrder}
          className="px-8 py-3 bg-white text-gray-800 rounded-full font-medium border border-gray-200 hover:bg-gray-50 transition-all"
        >
          Track Order
        </button>
      </div>
    </div>
  </div>
</section>


      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We take pride in delivering quality ice cream with exceptional service, ensuring a delightful experience with every order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<IceCream className="text-brand-pink" size={32} />}
              title="Premium Quality"
              description="Made with the finest ingredients for an authentic taste experience."
            />

            <FeatureCard
              icon={<Truck className="text-brand-pink" size={32} />}
              title="Fast Delivery"
              description="Quick delivery to ensure your ice cream arrives in perfect condition."
            />

            <FeatureCard
              icon={<ThumbsUp className="text-brand-pink" size={32} />}
              title="Customer Satisfaction"
              description="We prioritize your happiness with every scoop we deliver."
            />

            <FeatureCard
              icon={<Clock className="text-brand-pink" size={32} />}
              title="Convenient Hours"
              description="Order anytime and enjoy our ice cream when you want it most."
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Flavors</h2>
            <Link
              to="/products"
              className="flex items-center text-brand-pink font-medium hover:underline"
            >
              View All
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-pink to-red-400 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Satisfy Your Sweet Cravings?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Order now and experience the delicious taste of Bombay Chowpati ice cream delivered right to your doorstep.
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-4 bg-white text-brand-pink rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Order Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in">
      <div className="h-14 w-14 rounded-full bg-pink-50 flex items-center justify-center mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
};

export default Index;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchTermsConditions } from '@/services/contentService';
import { navigateBack } from '@/utils/navigationUtils';

const FALLBACK_TERMS_CONDITIONS = `
  <p>Sorry, we couldn't load the privacy policy. Please try again later.</p>
`;

const TermsConditions = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getTermsConditions = async () => {
      try {
        setLoading(true);
        const terms = await fetchTermsConditions();
        
        // Only clean the content if it's not empty
        if (terms && terms.trim()) {
          const cleanedContent = terms
            .replace(/<head>[\s\S]*?<\/head>/gi, '')
            .replace(/<style>[\s\S]*?<\/style>/gi, '')
            .replace(/class="container"/gi, 'class="max-w-4xl mx-auto"')
            .replace(/<h1/g, '<h1 class="text-3xl font-bold text-gray-900 mb-4"')
            .replace(/<h2/g, '<h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4"')
            .replace(/<p>/g, '<p class="text-gray-600 mb-4">')
            .replace(/<ul>/g, '<ul class="list-disc pl-6 mb-4 text-gray-600">')
            .replace(/<li>/g, '<li class="mb-2">');
        
          setContent(cleanedContent);
        } else {
          toast.error('Terms & conditions content is empty');
          setContent(FALLBACK_TERMS_CONDITIONS);
        }
      } catch (error) {
        console.error('Failed to load terms & conditions:', error);
        toast.error('Failed to load terms & conditions. Please try again later.');
        setContent(FALLBACK_TERMS_CONDITIONS);
      } finally {
        setLoading(false);
      }
    };

    getTermsConditions();
  }, []);

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
              type="button"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-brand-pink">Terms & Conditions</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink"></div>
              </div>
            ) : (
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsConditions; 

import React from 'react';
import { X } from 'lucide-react';

interface LegalDocumentModalProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

const LegalDocumentModal = ({ title, content, isOpen, onClose }: LegalDocumentModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-brand-pink">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-brand-pink transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto p-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-brand-pink text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalDocumentModal;
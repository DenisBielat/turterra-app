'use client'

import { Icon } from '@/components/Icon';
import { useEffect, useRef } from 'react';
import { Variant, FeatureVariants } from '@/types/features';

interface VariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  variants: FeatureVariants;
}

function formatModalValue(value: any): React.ReactNode {
  if (!value && value !== false) return '-';

  const stringValue = String(value);

  if (stringValue.toLowerCase() === 'true' || value === true) {
    return <Icon name="checkmark-2" size="sm" style="filled" className="text-green-600" />;
  }
  if (stringValue.toLowerCase() === 'false' || value === false) {
    return <Icon name="close" size="sm" style="filled" className="text-red-500" />;
  }

  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1).toLowerCase();
}

export default function VariantModal({ isOpen, onClose, featureName, variants }: VariantModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl m-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg">{featureName} Differences</h3>
          <button onClick={onClose} className="flex items-center justify-center text-gray-500 hover:text-black">
            <Icon name="close" size="sm" style="line" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Comparing Male Adult (reference) to other variants
          </p>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="font-heading px-4 py-2 text-left text-sm">Variant</th>
                  <th className="font-heading px-4 py-2 text-left text-sm">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2 text-sm align-middle">Reference (Male Adult)</td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center h-5">
                      {formatModalValue(variants.reference)}
                    </div>
                  </td>
                </tr>
                {variants.variants.map((variant, index) => (
                  <tr key={`${variant.sex}-${variant.lifeStage}`} className="border-t">
                    <td className="px-4 py-2 text-sm align-middle">
                      {variant.sex} {variant.lifeStage}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center h-5">
                        {formatModalValue(variant.value)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
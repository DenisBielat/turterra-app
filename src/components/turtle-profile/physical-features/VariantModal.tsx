'use client';

import { useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { VariantModalProps, Variant } from '@/types/turtleTypes';

// Helper to normalize values for comparison
function normalizeValue(value: unknown): string | null {
  if (value === false) return 'false';
  if (value === null || value === undefined || value === 'Unknown' || value === '-') return null;
  // Handle empty strings and whitespace-only strings as "no data"
  if (typeof value === 'string' && value.trim() === '') return null;
  if (typeof value === 'boolean' || value === 'true' || value === 'false') {
    return String(value).toLowerCase();
  }
  if (Array.isArray(value)) {
    const filtered = value.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
    if (filtered.length === 0) return null;
    return filtered
      .map(v => String(v).toLowerCase().trim())
      .sort()
      .join(', ');
  }
  return String(value).toLowerCase().trim().replace(/\s+/g, ' ');
}

// Helper to format boolean values with icons
function formatBooleanValue(value: unknown): React.ReactNode {
  const stringValue = String(value).toLowerCase();
  const isTrue = stringValue === 'true' || value === true;
  const isFalse = stringValue === 'false' || value === false;

  if (isTrue) {
    return (
      <span className="flex items-center gap-2 text-green-600 font-medium">
        <Icon name="checkmark-2" size="sm" style="filled" className="text-green-600 flex-shrink-0" />
        Present
      </span>
    );
  }
  if (isFalse) {
    return (
      <span className="flex items-center gap-2 text-red-500 font-medium">
        <Icon name="close" size="sm" style="filled" className="text-red-500 flex-shrink-0" />
        Absent
      </span>
    );
  }
  return null;
}

// Helper to format display values
function formatDisplayValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === '-') {
    return '-';
  }
  // Handle empty strings and whitespace-only strings as "no data"
  if (typeof value === 'string' && value.trim() === '') {
    return '-';
  }

  const stringValue = String(value);

  // Check for boolean values
  const boolResult = formatBooleanValue(value);
  if (boolResult) {
    return boolResult;
  }

  // Handle comma-separated values - capitalize each word
  if (stringValue.includes(',')) {
    return stringValue
      .split(',')
      .map(item => item.trim())
      .map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
      .join(', ');
  }

  // Handle single value - capitalize first letter
  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1).toLowerCase();
}

export default function VariantModal({
  isOpen,
  onClose,
  featureName,
  variants
}: VariantModalProps) {
  const handleChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  // Pre-compute which variants differ from reference
  const referenceNormalized = useMemo(
    () => normalizeValue(variants.reference),
    [variants.reference]
  );

  const variantsDifferFromReference = useMemo(() => {
    return variants.variants.map((variant) => {
      const variantNormalized = normalizeValue(variant.value);
      // Only consider it different if both have actual values and they differ
      if (referenceNormalized === null || variantNormalized === null) {
        return false;
      }
      return variantNormalized !== referenceNormalized;
    });
  }, [variants.variants, referenceNormalized]);

  return (
    <Dialog open={isOpen} onOpenChange={handleChange}>
      <DialogContent
        className="max-w-xl duration-300 [&>button]:hidden"
        aria-describedby="variant-modal-description"
      >
        {/* Close button in top-right */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <Icon name="close" size="md" style="outline" />
        </button>

        <DialogHeader className="pb-2">
          <DialogTitle className="font-heading font-bold text-xl">{featureName}</DialogTitle>
          <DialogDescription id="variant-modal-description" className="text-gray-500 text-sm">
            How this feature compares across life stages
          </DialogDescription>
        </DialogHeader>

        {/* Life stage rows */}
        <div className="flex flex-col gap-3 py-2">
          {/* Reference Row (Adult Male) - warm background */}
          <div className="grid grid-cols-[180px_1fr] gap-4 p-4 rounded-lg border border-gray-300 bg-stone-100">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="font-medium">Adult Male</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500 text-white font-medium">
                Reference
              </span>
            </div>
            <div>
              {formatDisplayValue(variants.reference)}
            </div>
          </div>

          {/* Other Variant Rows */}
          {variants.variants.map((variant: Variant, index: number) => {
            const isDifferent = variantsDifferFromReference[index];
            // lifeStage is now pre-formatted (e.g., "Adult Female", "Juvenile", "Hatchling")
            const label = variant.lifeStage;

            return (
              <div
                key={`${variant.sex}-${variant.lifeStage}`}
                className={`grid grid-cols-[180px_1fr] gap-4 p-4 rounded-lg border ${
                  isDifferent
                    ? 'border-orange-500 bg-orange-500/20'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <span className="font-medium whitespace-nowrap">{label}</span>
                <div>
                  {formatDisplayValue(variant.value)}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

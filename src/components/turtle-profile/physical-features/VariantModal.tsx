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
  if (typeof value === 'boolean' || value === 'true' || value === 'false') {
    return String(value).toLowerCase();
  }
  if (Array.isArray(value)) {
    return value
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
        <Icon name="checkmark-2" size="sm" style="filled" className="text-green-600" />
        Present
      </span>
    );
  }
  if (isFalse) {
    return (
      <span className="flex items-center gap-2 text-red-500 font-medium">
        <Icon name="close" size="sm" style="filled" className="text-red-500" />
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

// Helper to get display label for a variant
function getVariantLabel(variant: Variant): string {
  if (variant.lifeStage === 'Juvenile' || variant.lifeStage === 'Hatchling') {
    return variant.lifeStage;
  }
  return `${variant.sex} ${variant.lifeStage}`;
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
      return variantNormalized !== referenceNormalized;
    });
  }, [variants.variants, referenceNormalized]);

  return (
    <Dialog open={isOpen} onOpenChange={handleChange}>
      <DialogContent className="max-w-lg" aria-describedby="variant-modal-description">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-heading font-bold text-xl">{featureName}</DialogTitle>
          <DialogDescription id="variant-modal-description" className="text-gray-500 text-sm">
            How this feature varies across life stages
          </DialogDescription>
        </DialogHeader>

        {/* Life stage rows */}
        <div className="flex flex-col gap-3 py-2">
          {/* Reference Row (Adult Male) */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <span className="font-medium">Adult Male</span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-white font-medium">
                Reference
              </span>
            </div>
            <div className="text-right">
              {formatDisplayValue(variants.reference)}
            </div>
          </div>

          {/* Other Variant Rows */}
          {variants.variants.map((variant: Variant, index: number) => {
            const isDifferent = variantsDifferFromReference[index];
            const label = getVariantLabel(variant);

            return (
              <div
                key={`${variant.sex}-${variant.lifeStage}`}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isDifferent
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <span className="font-medium">{label}</span>
                <div className="text-right">
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

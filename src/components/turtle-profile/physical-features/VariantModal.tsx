'use client';

import { useCallback } from 'react';
// Shadcn UI imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
// Local imports
import { Icon } from '@/components/Icon';
// Import types from turtleTypes.ts
import { VariantModalProps, Variant } from '@/types/turtleTypes';

function formatModalValue(value: unknown): React.ReactNode {
  // Handle null, undefined, or empty
  if (!value && value !== false) return '-';

  const stringValue = String(value);

  // Boolean true
  if (stringValue.toLowerCase() === 'true' || value === true) {
    return <Icon name="checkmark-2" size="sm" style="filled" className="text-green-600" />;
  }
  // Boolean false
  if (stringValue.toLowerCase() === 'false' || value === false) {
    return <Icon name="close" size="sm" style="filled" className="text-red-500" />;
  }

  // Otherwise, just capitalize
  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1).toLowerCase();
}

export default function VariantModal({
  isOpen,
  onClose,
  featureName,
  variants
}: VariantModalProps) {
  // Optional: useCallback for close if you want
  const handleChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  // If you want to skip rendering entirely when closed:
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold">{featureName} | Differences</DialogTitle>
          <DialogDescription className="text-gray-500">
            Comparing Male Adult (reference) to other variants
          </DialogDescription>
        </DialogHeader>

        {/* Table of variants */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Reference Row */}
            <TableRow>
              <TableCell className="text-sm">Reference (Male Adult)</TableCell>
              <TableCell className="text-sm">
                <div className="flex items-center">
                  {formatModalValue(variants.reference)}
                </div>
              </TableCell>
            </TableRow>

            {/* Other Variant Rows */}
            {variants.variants.map((variant: Variant) => (
              <TableRow key={`${variant.sex}-${variant.lifeStage}`}>
                <TableCell className="text-sm">
                  {variant.sex} {variant.lifeStage}
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center">
                    {formatModalValue(variant.value)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
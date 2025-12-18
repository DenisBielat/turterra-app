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
import { formatModalValue } from '@/lib/formatters';
// Import types from turtleTypes.ts
import { VariantModalProps, Variant } from '@/types/turtleTypes';

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

  return (
    <Dialog open={isOpen} onOpenChange={handleChange}>
      <DialogContent className="max-w-2xl" aria-describedby="variant-modal-description">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold">{featureName} | Differences</DialogTitle>
          <DialogDescription id="variant-modal-description" className="text-gray-500">
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
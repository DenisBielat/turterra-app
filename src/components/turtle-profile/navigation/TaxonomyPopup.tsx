'use client';

import { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { TaxonomyData } from '@/types/turtleTypes';

interface TaxonomyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  taxonomy: TaxonomyData;
}

interface TaxonomyRowProps {
  common: string;
  scientific: string;
  rank: string;
}

function TaxonomyRow({ common, scientific, rank }: TaxonomyRowProps) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex flex-col gap-1">
        <span className="font-heading font-bold text-lg text-gray-900">{common}</span>
        <span className="italic text-gray-600">{scientific}</span>
      </div>
      <span className="text-sm font-medium text-gray-500 italic">{rank}</span>
    </div>
  );
}

export default function TaxonomyPopup({
  isOpen,
  onClose,
  taxonomy
}: TaxonomyPopupProps) {
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
      <DialogContent className="max-w-lg bg-warm rounded-xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="font-heading font-bold text-xl">
            Taxonomy at a Glance
          </DialogTitle>
          <VisuallyHidden>
            Taxonomic classification for this turtle species
          </VisuallyHidden>
        </DialogHeader>

        <div className="px-6 pb-6">
          <TaxonomyRow
            common={taxonomy.order.common}
            scientific={taxonomy.order.scientific}
            rank="Order"
          />
          <TaxonomyRow
            common={taxonomy.suborder.common}
            scientific={taxonomy.suborder.scientific}
            rank="Suborder"
          />
          <TaxonomyRow
            common={taxonomy.family.common}
            scientific={taxonomy.family.scientific}
            rank="Family"
          />
          <TaxonomyRow
            common={taxonomy.genus.common}
            scientific={taxonomy.genus.scientific}
            rank="Genus"
          />
          <TaxonomyRow
            common={taxonomy.species.common}
            scientific={taxonomy.species.scientific}
            rank="Species"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

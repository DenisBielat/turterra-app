"use client";

import { useState } from 'react';
import SpeciesComparison from '../physical-features/SpeciesComparison';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icon } from '@/components/Icon';

interface IdentificationProps {
  speciesId?: number;
  description: string;
  measurements: {
    adultWeight: {
      value: number | null;
      unit: 'g' | 'lbs';
    };
    length: {
      female: {
        value: number | null;
        unit: 'cm' | 'in';
      };
      male: {
        value: number | null;
        unit: 'cm' | 'in';
      };
      generallyLarger: 'female' | 'male' | 'equal' | null;
    };
    lifespan: {
      wild: string;
      captivity: string;
    };
  };
  featureCategories: {
    name: string;
    features: {
      name: string;
      value: string;
      subFeatures: {
        name: string;
        value: string;
      }[];
    }[];
  }[];
  speciesCard: {
    commonName: string;
    scientificName: string;
    avatarUrl: string;
    backgroundImageUrl?: string;
    variant: {
      sex: string;
      lifeStage: string;
    };
  };
  relatedSpecies: {
    commonName: string;
    scientificName: string;
    avatarUrl: string;
  }[];
}

// Conversion functions
const gramsToPounds = (grams: number): number => {
  return grams / 453.592;
};

const poundsToGrams = (pounds: number): number => {
  return pounds * 453.592;
};

const cmToInches = (cm: number): number => {
  return cm / 2.54;
};

const inchesToCm = (inches: number): number => {
  return inches * 2.54;
};

// Format number with appropriate decimal places
const formatNumber = (value: number, isWeight: boolean): string => {
  if (isWeight) {
    // For weight, show up to 2 decimal places if needed, otherwise show as integer
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  } else {
    // For length, show 1 decimal place
    return value.toFixed(1);
  }
};

export default function Identification({
  speciesId,
  description,
  measurements,
  featureCategories,
  speciesCard,
  relatedSpecies = [],
}: IdentificationProps) {
  // State for unit toggles - default to grams and centimeters
  const [weightUnit, setWeightUnit] = useState<'g' | 'lbs'>('g');
  const [lengthUnit, setLengthUnit] = useState<'cm' | 'in'>('cm');

  // Convert and format weight
  const getWeightDisplay = () => {
    if (measurements.adultWeight.value === null) {
      return { value: 'Unknown', unit: '' };
    }

    let displayValue: number;
    let displayUnit: string;

    if (weightUnit === 'g') {
      displayValue = measurements.adultWeight.value;
      displayUnit = 'g';
    } else {
      // Convert grams to pounds
      displayValue = gramsToPounds(measurements.adultWeight.value);
      displayUnit = 'lbs';
    }

    return {
      value: formatNumber(displayValue, true),
      unit: displayUnit
    };
  };

  // Convert and format length
  const getLengthDisplay = (lengthValue: number | null) => {
    if (lengthValue === null) {
      return { value: 'Unknown', unit: '' };
    }

    let displayValue: number;
    let displayUnit: string;

    if (lengthUnit === 'cm') {
      displayValue = lengthValue;
      displayUnit = 'cm';
    } else {
      // Convert cm to inches
      displayValue = cmToInches(lengthValue);
      displayUnit = 'in';
    }

    return {
      value: formatNumber(displayValue, false),
      unit: displayUnit
    };
  };

  const weightDisplay = getWeightDisplay();
  const femaleLengthDisplay = getLengthDisplay(measurements.length.female.value);
  const maleLengthDisplay = getLengthDisplay(measurements.length.male.value);

  return (
    <section id="identification-section">
      <h2 id="identification" className="scroll-m-20 text-3xl md:text-5xl">
        Identification
      </h2>

      <div className="mt-6 md:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-9 gap-4">
          {/* Left content area - Description */}
          <div className="col-span-1 md:col-span-5">
            <div className="font-heading text-lg md:text-xl font-semibold">Description</div>
            <div className="mt-4 text-base md:text-lg whitespace-pre-line">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {description}
              </ReactMarkdown>
            </div>
          </div>

          {/* Empty column for spacing - hidden on mobile */}
          <div className="hidden md:block md:col-span-1" />

          {/* Right content area - Measurements */}
          <div className="col-span-1 md:col-span-3 mt-6 md:mt-0">
            {/* Mobile: horizontal scroll, Desktop: vertical stack */}
            <div className="flex md:flex-col gap-4 md:gap-0 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
              {/* Adult Weight */}
              <div className="w-[280px] md:w-auto flex-shrink-0 md:flex-shrink snap-center md:snap-align-none bg-warm-50 md:bg-transparent rounded-lg md:rounded-none p-4 md:p-0 md:pb-6 border border-gray-200 md:border-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm uppercase text-green-900">Adult Weight</div>
                  <div className="flex gap-1 bg-gray-100 rounded-md p-0.5">
                    <button
                      onClick={() => setWeightUnit('g')}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        weightUnit === 'g'
                          ? 'bg-white text-green-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      g
                    </button>
                    <button
                      onClick={() => setWeightUnit('lbs')}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        weightUnit === 'lbs'
                          ? 'bg-white text-green-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      lbs
                    </button>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl md:text-3xl font-bold leading-none">
                    {weightDisplay.value}
                  </span>
                  {weightDisplay.unit && (
                    <span className="text-sm md:text-base font-normal">
                      {weightDisplay.unit}
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-gray-700">
                  Best estimate of natural adult weight based on turtles caught in the wild.
                </p>
              </div>

              {/* Divider - hidden on mobile */}
              <div className="hidden md:block w-full h-px bg-gray-300 mb-6" />

              {/* Length */}
              <div className="w-[280px] md:w-auto flex-shrink-0 md:flex-shrink snap-center md:snap-align-none bg-warm-50 md:bg-transparent rounded-lg md:rounded-none p-4 md:p-0 md:pt-6 md:pb-6 border border-gray-200 md:border-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm uppercase text-green-900">Length (Max SCL)</div>
                  <div className="flex gap-1 bg-gray-100 rounded-md p-0.5">
                    <button
                      onClick={() => setLengthUnit('cm')}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        lengthUnit === 'cm'
                          ? 'bg-white text-green-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      cm
                    </button>
                    <button
                      onClick={() => setLengthUnit('in')}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        lengthUnit === 'in'
                          ? 'bg-white text-green-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      in
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 md:gap-8 mb-2">
                  {/* Female Column */}
                  <div className="flex-1">
                    <div className="text-xs md:text-sm mb-1 flex items-center gap-1">
                      <Icon name="female" style="line" size="sm" />
                      <span>Female</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-bold leading-none">
                        {femaleLengthDisplay.value}
                      </span>
                      {femaleLengthDisplay.unit && (
                        <span className="text-sm md:text-base font-normal">
                          {femaleLengthDisplay.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Male Column */}
                  <div className="flex-1">
                    <div className="text-xs md:text-sm mb-1 flex items-center gap-1">
                      <Icon name="male" style="line" size="sm" />
                      <span>Male</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-bold leading-none">
                        {maleLengthDisplay.value}
                      </span>
                      {maleLengthDisplay.unit && (
                        <span className="text-sm md:text-base font-normal">
                          {maleLengthDisplay.unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-700">
                  {measurements.length.generallyLarger === 'female'
                    ? 'The female is generally larger than the male.'
                    : measurements.length.generallyLarger === 'male'
                    ? 'The male is generally larger than the female.'
                    : measurements.length.generallyLarger === 'equal'
                    ? 'Both sexes are about the same in length.'
                    : 'The female is generally larger than the male.'}
                </p>
              </div>

              {/* Divider - hidden on mobile */}
              <div className="hidden md:block w-full h-px bg-gray-300 mb-6" />

              {/* Lifespan */}
              <div className="w-[280px] md:w-auto flex-shrink-0 md:flex-shrink snap-center md:snap-align-none bg-warm-50 md:bg-transparent rounded-lg md:rounded-none p-4 md:p-0 md:pt-6 border border-gray-200 md:border-0">
                <div className="text-sm uppercase mb-3 text-green-900">Lifespan</div>
                <div className="flex items-start gap-4 md:gap-8 mb-2">
                  <div className="flex-1">
                    <div className="text-xs md:text-sm mb-1">In the Wild</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-bold leading-none">
                        {measurements.lifespan.wild === 'Unknown'
                          ? 'Unknown'
                          : measurements.lifespan.wild.split(' ')[0]}
                      </span>
                      {measurements.lifespan.wild !== 'Unknown' && (
                        <span className="text-sm md:text-base font-normal">
                          {measurements.lifespan.wild.split(' ').slice(1).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs md:text-sm mb-1">In Captivity</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-bold leading-none">
                        {measurements.lifespan.captivity === 'Unknown'
                          ? 'Unknown'
                          : measurements.lifespan.captivity.split(' ')[0]}
                      </span>
                      {measurements.lifespan.captivity !== 'Unknown' && (
                        <span className="text-sm md:text-base font-normal">
                          {measurements.lifespan.captivity.split(' ').slice(1).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-700">
                  These are best estimates based on what has been observed and recorded.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Features Header*/}
        <div className="mt-8 md:mt-12 max-w-lg">
          <h3 className="text-2xl md:text-3xl font-bold">Physical Features</h3>
          <p className="mt-2 text-sm md:text-base">
          Features shown are for Adult Males (reference). Look for the variant icon{' '}
          <span className="inline-flex items-center justify-center rounded bg-gray-200/60 px-1.5 py-0.5 align-baseline">
            <Icon
              name="split-3"
              size="sm"
              style="line"
              className="text-violet-800"
            />
          </span>{' '}
          to see how a feature differs by sex or life stage.
          </p>
        </div>

        {/* Physical Features Accordions/Tables Row */}
        <div className="mt-8">
          <SpeciesComparison
            primarySpecies={{
              speciesCard,
              featureCategories
            }}
            primarySpeciesId={speciesId}
            relatedSpecies={relatedSpecies}
          />
        </div>
      </div>
    </section>
  );
} 
import { supabase } from '@/lib/db/supabaseClient';
import { getPhysicalFeatureImages } from '@/lib/db/cloudinary';
import {
  TurtleData,
  FeatureCategory,
  PhysicalFeatureData,
  PhysicalFeature,
  Variant
} from '@/types/turtleTypes';

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
  if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((v: unknown) => String(v).toLowerCase().trim())
          .sort()
          .join(', ');
      }
    } catch {
      // Ignore parse errors
    }
  }
  return String(value).toLowerCase().trim().replace(/\s+/g, ' ');
}

async function fetchRawTurtleRow(column: 'slug' | 'species_scientific_name', value: string) {
  // fetching turtle data
  
  const { data: turtle, error } = await supabase
    .from('turtle_species')
    .select(`
      id,
      species_common_name,
      species_scientific_name,
      other_common_names,
      avatar_image_circle_url,
      avatar_image_full_url,
      tax_parent_genus,
      turtle_species_section_descriptions (
        at_a_glance,
        identification,
        distribution,
        habitat
      ),
      turtle_species_measurements (
        adult_weight,
        length_female_max_scl,
        length_male_max_scl,
        lifespan_wild_min,
        lifespan_wild_max,
        lifespan_captivity_min,
        lifespan_captivity_max
      ),
      turtle_species_conservation_history(
        year_status_assigned,
        conservation_statuses(
          status,
          abbreviation
        )
      ),
      turtle_species_population_estimate_history(
        population_estimate,
        population_trend,
        year_of_estimate
      ),
      turtle_species_habitats(
        habitats(habitat, icon)
      ),
      turtle_species_ecologies(
        ecologies(ecology)
      )
    `)
    .eq(column, value)
    .single<TurtleData>();

  if (error) {
    console.error('Error fetching turtle data', column, value, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  // fetched turtle data
  return turtle ?? null;
}

async function fetchRelatedTurtleData(turtle: TurtleData) {
  // Fetch images
  const categoryImages = await getPhysicalFeatureImages(turtle.species_common_name);

  // Fetch physical features and keys
  const [physicalFeatures, featureKeys] = await Promise.all([
    supabase
      .from('turtle_species_physical_features')
      .select('*')
      .eq('species_id', turtle.id)
      .order('sex')
      .order('life_stage'),
    supabase
      .from('turtle_species_physical_features_key')
      .select('*')
  ]);

  if (physicalFeatures.error || featureKeys.error) {
    console.error(
      'Error fetching physical features or keys:',
      physicalFeatures.error || featureKeys.error
    );
    throw physicalFeatures.error || featureKeys.error;
  }

  // Fetch related species in the same family
  const { data: relatedSpecies, error: relatedError } = await supabase
    .from('turtle_species')
    .select(`
      species_common_name,
      species_scientific_name,
      avatar_image_full_url
    `)
    .eq('tax_parent_genus', turtle.tax_parent_genus)
    .neq('id', turtle.id)
    .limit(5);

  if (relatedError) {
    console.error('Error fetching related species:', relatedError);
    throw relatedError;
  }

  return {
    categoryImages,
    physicalFeatures: physicalFeatures.data || [],
    featureKeys: featureKeys.data || [],
    relatedSpecies: relatedSpecies || []
  };
}

function pickReferenceAndOtherVariants(physicalFeatures: PhysicalFeatureData[]) {
  const referenceVariant = physicalFeatures.find(
    (variant) => variant.sex === 'Male' && variant.life_stage === 'Adult'
  ) || physicalFeatures[0];

  const otherVariants = physicalFeatures.filter(
    (variant) => !(variant.sex === 'Male' && variant.life_stage === 'Adult')
  );

  return { referenceVariant, otherVariants };
}

function buildFeatureCategories({
  featureKeys,
  referenceVariant,
  otherVariants,
  categoryImages
}: {
  featureKeys: PhysicalFeature[];
  referenceVariant?: PhysicalFeatureData;
  otherVariants: PhysicalFeatureData[];
  categoryImages: { url: string; tags: string[] }[];
}): FeatureCategory[] {
  return featureKeys
    .filter(key => !key.parent_feature)
    .reduce<FeatureCategory[]>((acc, key) => {
      // Find/create category
      let category = acc.find(c => c.name === key.category);
      if (!category) {
        category = { name: key.category, image: undefined, features: [] };
        acc.push(category);
      }

      // Assign category image if missing
      if (!category.image) {
        const featureTag = key.category.toLowerCase().replace(/\//g, '-and-').replace(/\s+/g, '-');
        const categoryImage = categoryImages.find(img => img.tags.includes(featureTag));
        category.image = { url: categoryImage?.url || '/images/image-placeholder.png' };
      }

      // Reference & variants
      const columnName = key.physical_feature.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
      const referenceValueRaw = referenceVariant?.[columnName] ?? '-';
      const referenceValue = String(referenceValueRaw);

      const variantDifferences = otherVariants.reduce<Variant[]>((variants, variant) => {
        const variantValue = normalizeValue(variant[columnName]);
        const referenceNormalized = normalizeValue(referenceValueRaw);
        if (variantValue && referenceNormalized && variantValue !== referenceNormalized) {
          variants.push({
            sex: variant.sex,
            lifeStage: variant.life_stage,
            value: variant[columnName]
          });
        }
        return variants;
      }, []);

      const featureVariants = variantDifferences.length
        ? { reference: referenceValue, variants: variantDifferences }
        : undefined;

      // Sub-features
      const subFeatures = featureKeys
        .filter(subKey => subKey.parent_feature === key.id)
        .map(subKey => {
          const subColumnName = subKey.physical_feature
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/\//g, '_');
          const subReferenceValueRaw = referenceVariant?.[subColumnName] ?? '-';
          const subReferenceValue = String(subReferenceValueRaw);

          const subVariantDifferences = otherVariants.reduce<Variant[]>((variants, variant) => {
            const variantValue = normalizeValue(variant[subColumnName]);
            const referenceNormalized = normalizeValue(subReferenceValueRaw);
            if (variantValue && referenceNormalized && variantValue !== referenceNormalized) {
              variants.push({
                sex: variant.sex,
                lifeStage: variant.life_stage,
                value: variant[subColumnName]
              });
            }
            return variants;
          }, []);

          const subFeatureVariants = subVariantDifferences.length
            ? { reference: subReferenceValue, variants: subVariantDifferences }
            : undefined;

          return {
            name: subKey.physical_feature,
            value: subReferenceValue,
            variants: subFeatureVariants
          };
        });

      category.features.push({
        name: key.physical_feature,
        value: referenceValue,
        variants: featureVariants,
        subFeatures
      });

      return acc;
    }, []);
}

function transformTurtleDataToProfile(
  turtle: TurtleData,
  {
    categoryImages,
    physicalFeatures,
    featureKeys,
    relatedSpecies
  }: {
    categoryImages: Awaited<ReturnType<typeof getPhysicalFeatureImages>>;
    physicalFeatures: PhysicalFeatureData[];
    featureKeys: PhysicalFeature[];
    relatedSpecies: { 
      species_common_name: string; 
      species_scientific_name: string; 
      avatar_image_full_url?: string; 
    }[];
  }
) {
  // Format related species
  const formattedRelatedSpecies = relatedSpecies.map(species => ({
    commonName: species.species_common_name,
    scientificName: species.species_scientific_name,
    avatarUrl: species.avatar_image_full_url || '/images/image-placeholder.png'
  }));

  // Extract needed fields
  const {
    species_common_name,
    species_scientific_name,
    other_common_names,
    avatar_image_circle_url,
    turtle_species_conservation_history,
    turtle_species_population_estimate_history,
    turtle_species_habitats,
    turtle_species_ecologies,
    turtle_species_section_descriptions,
    turtle_species_measurements
  } = turtle;

  // Conservation status
  const latestConservation = turtle_species_conservation_history
    ?.sort((a, b) => b.year_status_assigned.localeCompare(a.year_status_assigned))[0];
  const conservationStatus = latestConservation
    ? {
        status: latestConservation.conservation_statuses.status,
        code: latestConservation.conservation_statuses.abbreviation,
        year: parseInt(latestConservation.year_status_assigned, 10) || 0
      }
    : { status: "Unknown", code: "NA", year: 0 };

  // Population
  const latestPopulation = turtle_species_population_estimate_history
    ?.sort((a, b) => b.year_of_estimate.localeCompare(a.year_of_estimate))[0];
  const population = latestPopulation?.population_estimate
    ? latestPopulation.population_estimate.toLocaleString()
    : "Unknown";
  const populationTrend = latestPopulation?.population_trend || "Unknown";

  // Habitats / ecologies
  const habitatString = turtle_species_habitats
    ?.map(h => h.habitats.habitat).join(", ") || "Unknown";
  const ecologyString = turtle_species_ecologies
    ?.map(e => e.ecologies.ecology).join(", ") || "Unknown";

  // Stats
  const stats = {
    population,
    populationTrend,
    habitat: habitatString,
    region: "Unknown",
    ecology: ecologyString,
    category: "Unknown"
  };

  // Measurements
  const measurementData = turtle_species_measurements?.[0];
  const measurements = measurementData
    ? {
        adultWeight: measurementData.adult_weight 
          ? `${measurementData.adult_weight} lbs` 
          : 'Unknown',
        length: {
          female: measurementData.length_female_max_scl
            ? `${measurementData.length_female_max_scl} cm`
            : 'Unknown',
          male: measurementData.length_male_max_scl
            ? `${measurementData.length_male_max_scl} cm`
            : 'Unknown'
        },
        lifespan: {
          wild: measurementData.lifespan_wild_max
            ? `${measurementData.lifespan_wild_max} years`
            : 'Unknown',
          captivity: measurementData.lifespan_captivity_max
            ? `${measurementData.lifespan_captivity_max} years`
            : 'Unknown'
        }
      }
    : {
        adultWeight: 'Unknown',
        length: { female: 'Unknown', male: 'Unknown' },
        lifespan: { wild: 'Unknown', captivity: 'Unknown' }
      };

  // Section descriptions
  const sectionDescriptions = turtle_species_section_descriptions?.[0];

  // Physical feature categories
  const { referenceVariant, otherVariants } = pickReferenceAndOtherVariants(physicalFeatures);
  const featureCategories = buildFeatureCategories({
    featureKeys,
    referenceVariant,
    otherVariants,
    categoryImages
  });

  // Final object
  return {
    id: turtle.id,
    commonName: species_common_name,
    scientificName: species_scientific_name,
    profileImage: avatar_image_circle_url || "",
    description: sectionDescriptions?.at_a_glance || `Learn about the ${species_common_name}.`,
    conservationStatus, 
    stats,
    commonNames: other_common_names || [],
    identification: {
      description: sectionDescriptions?.identification || "",
      physicalFeatures: "Physical features description...",
      measurements,
      featureCategories,
      speciesCard: {
        commonName: species_common_name,
        scientificName: species_scientific_name,
        avatarUrl: avatar_image_circle_url || "",
        backgroundImageUrl: "/images/textures/grain-overlay.jpg",
        variant: {
          sex: "Male",
          lifeStage: "Adult"
        }
      },
      relatedSpecies: formattedRelatedSpecies
    },
    distributionText: sectionDescriptions?.distribution,
    habitat: {
      description: sectionDescriptions?.habitat || "",
      habitats: turtle_species_habitats?.map(h => ({
        name: h.habitats.habitat,
        icon: h.habitats.icon
      })) || []
    }
  };
}

// Publicly exported functions:
export async function getTurtleData(slug: string) {
  try {
    const turtle = await fetchRawTurtleRow('slug', slug);
    if (!turtle) return null;

    const relatedData = await fetchRelatedTurtleData(turtle);

    return transformTurtleDataToProfile(turtle, relatedData);
  } catch (error) {
    console.error('Error in getTurtleData:', error);
    throw error;
  }
}

// Debug function to check available slugs
export async function debugAvailableSlugs() {
  try {
    const { data, error } = await supabase
      .from('turtle_species')
      .select('slug, species_common_name')
      .limit(10);
    
    if (error) {
      console.error('Error fetching slugs:', error);
      return [];
    }
    
    console.log('📋 Available slugs:', data);
    return data;
  } catch (error) {
    console.error('Error in debugAvailableSlugs:', error);
    return [];
  }
}

export async function getTurtleDataByScientificName(scientificName: string) {
  try {
    const turtle = await fetchRawTurtleRow('species_scientific_name', scientificName);
    if (!turtle) return null;

    const relatedData = await fetchRelatedTurtleData(turtle);

    return transformTurtleDataToProfile(turtle, relatedData);
  } catch (error) {
    console.error('Error in getTurtleDataByScientificName:', error);
    throw error;
  }
}
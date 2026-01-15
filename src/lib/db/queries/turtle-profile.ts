import { supabase } from '@/lib/db/supabaseClient';
import { getPhysicalFeatureImages } from '@/lib/db/cloudinary';
import {
  TurtleData,
  FeatureCategory,
  PhysicalFeatureData,
  PhysicalFeature,
  Variant,
  TaxonomyData
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
      limited_information_toggle,
      limited_information_description,
      turtle_species_section_descriptions (
        at_a_glance,
        identification,
        distribution,
        habitat,
        diet,
        hibernation,
        nesting,
        unique_traits_and_qualities,
        conservation,
        predators,
        threats
      ),
      turtle_species_measurements (
        adult_weight,
        length_female_max_scl,
        length_male_max_scl,
        generally_larger,
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
      ),
      turtle_species_habitat_types(
        habitat_types(habitat_type)
      ),
      turtle_species_regions_general(
        regions_general(region_name)
      ),
      turtle_species_threats(
        threats_list(
          threat_name,
          icon
        )
      ),
      turtle_species_references(
        id,
        reference_type,
        citation_full,
        citation_short,
        authors,
        year,
        title,
        source_name,
        url,
        doi
      )
    `)
    .eq(column, value)
    .single<TurtleData>();

  if (error) {
    console.error('Error fetching turtle data', column, value, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      error: error
    });
    throw error;
  }

  // fetched turtle data
  return turtle ?? null;
}

async function fetchRelatedTurtleData(turtle: TurtleData) {
  // Fetch images
  const categoryImages = await getPhysicalFeatureImages(turtle.species_common_name);

  // Fetch physical features and keys from the new tables
  const [physicalFeatures, featureKeys] = await Promise.all([
    supabase
      .from('turtle_species_physical_features_new')
      .select('*')
      .eq('species_id', turtle.id)
      .order('life_stage')
      .order('sex'),
    supabase
      .from('turtle_species_physical_features_key_new')
      .select('*')
  ]);

  if (physicalFeatures.error || featureKeys.error) {
    console.error(
      'Error fetching physical features or keys:',
      physicalFeatures.error || featureKeys.error
    );
    throw physicalFeatures.error || featureKeys.error;
  }

  // Fetch related species in the same family (with conservation status)
  const { data: relatedSpecies, error: relatedError } = await supabase
    .from('turtle_species')
    .select(`
      species_common_name,
      species_scientific_name,
      avatar_image_full_url,
      avatar_image_circle_url,
      turtle_species_conservation_history(
        year_status_assigned,
        conservation_statuses(
          status,
          abbreviation
        )
      )
    `)
    .eq('tax_parent_genus', turtle.tax_parent_genus)
    .neq('id', turtle.id)
    .limit(5);

  if (relatedError) {
    console.error('Error fetching related species:', relatedError);
    throw relatedError;
  }

  // Fetch behaviors - make it optional so it doesn't break if table doesn't exist
  // Schema: turtle_species_behaviors_general has species_id and behavior_id
  // behaviors_general has behavior, behavior_description, behavior_icon
  const { data: behaviorsData, error: behaviorsError } = await supabase
    .from('turtle_species_behaviors_general')
    .select(`
      behaviors_general(behavior, behavior_description, behavior_icon)
    `)
    .eq('species_id', turtle.id);

  if (behaviorsError) {
    console.warn('Error fetching behaviors (this is optional):', behaviorsError.message);
    console.warn('Behaviors error details:', behaviorsError);
    // Don't throw - just log and continue with empty array
  } else {
    console.log('Behaviors data fetched:', behaviorsData);
    console.log('Behaviors count:', behaviorsData?.length || 0);
  }

  // Fetch all conservation statuses
  const { data: conservationStatuses, error: conservationStatusesError } = await supabase
    .from('conservation_statuses')
    .select('*')
    .order('order_of_concern', { ascending: true });

  if (conservationStatusesError) {
    console.warn('Error fetching conservation statuses:', conservationStatusesError);
  }

  return {
    categoryImages,
    physicalFeatures: physicalFeatures.data || [],
    featureKeys: featureKeys.data || [],
    relatedSpecies: relatedSpecies || [],
    behaviors: behaviorsData || [],
    conservationStatuses: conservationStatuses || []
  };
}

async function fetchTaxonomyData(
  genusId: number,
  speciesCommonName: string,
  speciesScientificName: string
): Promise<TaxonomyData | null> {
  // Fetch genus data
  const { data: genus, error: genusError } = await supabase
    .from('turtle_taxonomy_genuses')
    .select('*')
    .eq('id', genusId)
    .single();

  if (genusError || !genus) {
    console.warn('Error fetching genus:', genusError?.message);
    return null;
  }

  // Fetch family data
  const { data: family, error: familyError } = await supabase
    .from('turtle_taxonomy_families')
    .select('*')
    .eq('id', genus.tax_parent_family)
    .single();

  if (familyError || !family) {
    console.warn('Error fetching family:', familyError?.message);
    return null;
  }

  // Fetch suborder data
  const { data: suborder, error: suborderError } = await supabase
    .from('turtle_taxonomy_suborders')
    .select('*')
    .eq('id', family.tax_parent_suborder)
    .single();

  if (suborderError || !suborder) {
    console.warn('Error fetching suborder:', suborderError?.message);
    return null;
  }

  // Fetch order data
  const { data: order, error: orderError } = await supabase
    .from('turtle_taxonomy_orders')
    .select('*')
    .eq('id', suborder.tax_parent_order)
    .single();

  if (orderError || !order) {
    console.warn('Error fetching order:', orderError?.message);
    return null;
  }

  return {
    order: {
      scientific: order.order_scientific || 'Unknown',
      common: order.order_common_name || 'Unknown'
    },
    suborder: {
      scientific: suborder.suborder_scientific || 'Unknown',
      common: suborder.suborder_common_name || 'Unknown'
    },
    family: {
      scientific: family.family_scientific_name || 'Unknown',
      common: family.family_common_name || 'Unknown'
    },
    genus: {
      scientific: genus.genus_scientific_name || 'Unknown',
      common: genus.genus_common_name || 'Unknown'
    },
    species: {
      scientific: speciesScientificName,
      common: speciesCommonName
    }
  };
}

function pickReferenceAndOtherVariants(physicalFeatures: PhysicalFeatureData[]) {
  // Helper for case-insensitive string comparison
  const equalsIgnoreCase = (a: string | null | undefined, b: string | null | undefined): boolean => {
    if (a === null || a === undefined || a === '') {
      return b === null || b === undefined || b === '';
    }
    if (b === null || b === undefined || b === '') {
      return false;
    }
    return a.toLowerCase() === b.toLowerCase();
  };

  // Reference is Adult Male (case-insensitive)
  const referenceVariant = physicalFeatures.find(
    (variant) => equalsIgnoreCase(variant.sex, 'Male') && equalsIgnoreCase(variant.life_stage, 'Adult')
  ) || physicalFeatures[0];

  // Helper to check if sex matches (handles null, undefined, empty string)
  const sexMatches = (variantSex: string | null | undefined, targetSex: string | null) => {
    if (targetSex === null) {
      // For generic records, sex should be null, undefined, or empty
      return variantSex === null || variantSex === undefined || variantSex === '';
    }
    return equalsIgnoreCase(variantSex, targetSex);
  };

  // Define the order of variants we want to compare against
  // Adult Female, Juvenile (generic), Hatchling (generic)
  // Skip the generic adult record (sex=null, life_stage='Adult') as it's for record keeping only
  const variantOrder: { sex: string | null; life_stage: string }[] = [
    { sex: 'Female', life_stage: 'Adult' },
    { sex: null, life_stage: 'Juvenile' },
    { sex: null, life_stage: 'Hatchling' }
  ];

  // Build the ordered list of variants, only including those that exist
  const otherVariants = variantOrder
    .map(({ sex, life_stage }) =>
      physicalFeatures.find(
        (variant) => sexMatches(variant.sex, sex) && equalsIgnoreCase(variant.life_stage, life_stage)
      )
    )
    .filter((variant): variant is PhysicalFeatureData => variant !== undefined);

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
  categoryImages: { url: string; tags: string[]; metadata?: { pictured_life_stages?: string; life_stages_descriptor?: string; asset_type?: string; credits_basic?: string } }[];
}): FeatureCategory[] {
  // Helper for case-insensitive comparison
  const equalsIgnoreCase = (a: string | null | undefined, b: string | null | undefined): boolean => {
    if (a === null || a === undefined || a === '') {
      return b === null || b === undefined || b === '';
    }
    if (b === null || b === undefined || b === '') {
      return false;
    }
    return a.toLowerCase() === b.toLowerCase();
  };

  // Define all expected variants with their display labels
  // These will always be shown in the modal
  const expectedVariants: { sex: string | null; lifeStage: string; label: string }[] = [
    { sex: 'Female', lifeStage: 'Adult', label: 'Adult Female' },
    { sex: null, lifeStage: 'Juvenile', label: 'Juvenile' },
    { sex: null, lifeStage: 'Hatchling', label: 'Hatchling' }
  ];

  // Helper to find a variant record by sex and life stage
  const findVariantRecord = (sex: string | null, lifeStage: string): PhysicalFeatureData | undefined => {
    return otherVariants.find(v => {
      const sexMatches = sex === null
        ? (v.sex === null || v.sex === undefined || v.sex === '')
        : equalsIgnoreCase(v.sex, sex);
      return sexMatches && equalsIgnoreCase(v.life_stage, lifeStage);
    });
  };

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
        const categoryName = key.category.toLowerCase();
        // Map old tag names to new tag names
        const tagMapping: Record<string, string> = {
          'shell-top': 'carapace',
          'shell-bottom': 'plastron'
        };
        
        // Try to find image with new tag name first, then fall back to old tag name
        const normalizedCategory = categoryName.replace(/\//g, '-and-').replace(/\s+/g, '-');
        const newTag = tagMapping[normalizedCategory] || normalizedCategory;
        const oldTag = normalizedCategory;
        
        const categoryImage = categoryImages.find(img => 
          img.tags.includes(newTag) || img.tags.includes(oldTag)
        );
        
        category.image = { 
          url: categoryImage?.url || '/images/image-placeholder.png',
          metadata: categoryImage?.metadata
        };
      }

      // Reference & variants
      const columnName = key.physical_feature.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
      const referenceValueRaw = referenceVariant?.[columnName] ?? null;
      const referenceValue = referenceValueRaw !== null ? String(referenceValueRaw) : '-';
      const referenceNormalized = normalizeValue(referenceValueRaw);

      // Build all variants - always include all expected life stages
      const allVariants: Variant[] = [];
      let hasDifferences = false;

      for (const expected of expectedVariants) {
        const variantRecord = findVariantRecord(expected.sex, expected.lifeStage);
        const variantValueRaw = variantRecord?.[columnName] ?? null;
        const variantNormalized = normalizeValue(variantValueRaw);

        // Always add this variant (with "-" if no data)
        allVariants.push({
          sex: expected.sex,
          lifeStage: expected.label, // Use the formatted label
          value: variantValueRaw !== null ? variantValueRaw : '-'
        });

        // Check if this variant differs from reference (only if both have actual values)
        if (referenceNormalized && variantNormalized && variantNormalized !== referenceNormalized) {
          hasDifferences = true;
        }
      }

      // Only create featureVariants if there are differences to show
      const featureVariants = hasDifferences
        ? { reference: referenceValue, variants: allVariants, hasDifferences }
        : undefined;

      // Sub-features
      const subFeatures = featureKeys
        .filter(subKey => subKey.parent_feature === key.id)
        .map(subKey => {
          const subColumnName = subKey.physical_feature
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/\//g, '_');
          const subReferenceValueRaw = referenceVariant?.[subColumnName] ?? null;
          const subReferenceValue = subReferenceValueRaw !== null ? String(subReferenceValueRaw) : '-';
          const subReferenceNormalized = normalizeValue(subReferenceValueRaw);

          // Build all variants for sub-features
          const subAllVariants: Variant[] = [];
          let subHasDifferences = false;

          for (const expected of expectedVariants) {
            const variantRecord = findVariantRecord(expected.sex, expected.lifeStage);
            const variantValueRaw = variantRecord?.[subColumnName] ?? null;
            const variantNormalized = normalizeValue(variantValueRaw);

            // Always add this variant (with "-" if no data)
            subAllVariants.push({
              sex: expected.sex,
              lifeStage: expected.label,
              value: variantValueRaw !== null ? variantValueRaw : '-'
            });

            // Check if this variant differs from reference
            if (subReferenceNormalized && variantNormalized && variantNormalized !== subReferenceNormalized) {
              subHasDifferences = true;
            }
          }

          const subFeatureVariants = subHasDifferences
            ? { reference: subReferenceValue, variants: subAllVariants, hasDifferences: subHasDifferences }
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
    relatedSpecies,
    behaviors,
    conservationStatuses
  }: {
    categoryImages: Awaited<ReturnType<typeof getPhysicalFeatureImages>>;
    physicalFeatures: PhysicalFeatureData[];
    featureKeys: PhysicalFeature[];
    relatedSpecies: {
      species_common_name: string;
      species_scientific_name: string;
      avatar_image_full_url?: string;
      avatar_image_circle_url?: string;
      turtle_species_conservation_history?: Array<{
        year_status_assigned: string;
        conservation_statuses: Array<{
          status: string;
          abbreviation: string;
        }>;
      }>;
    }[];
    behaviors?: Array<{
      behaviors_general: {
        behavior: string;
        behavior_icon: string;
        behavior_description?: string | null;
      } | Array<{
        behavior: string;
        behavior_icon: string;
        behavior_description?: string | null;
      }>;
    }>;
    conservationStatuses?: Array<{
      id: string;
      status: string;
      abbreviation: string;
      definition?: string | null;
      order_of_concern?: number | null;
    }>;
  }
) {
  // Format related species
  const formattedRelatedSpecies = relatedSpecies.map(species => {
    // Get the latest conservation status
    const latestHistory = species.turtle_species_conservation_history
      ?.sort((a, b) => b.year_status_assigned.localeCompare(a.year_status_assigned))[0];

    return {
      commonName: species.species_common_name,
      scientificName: species.species_scientific_name,
      avatarUrl: species.avatar_image_full_url || '/images/image-placeholder.png',
      avatarCircleUrl: species.avatar_image_circle_url || undefined,
      conservationStatus: latestHistory?.conservation_statuses?.[0]?.status
    };
  });

  // Extract needed fields
  const {
    species_common_name,
    species_scientific_name,
    other_common_names,
    avatar_image_circle_url,
    limited_information_toggle,
    limited_information_description,
    turtle_species_conservation_history,
    turtle_species_population_estimate_history,
    turtle_species_habitats,
    turtle_species_ecologies,
    turtle_species_habitat_types,
    turtle_species_regions_general,
    turtle_species_section_descriptions,
    turtle_species_measurements,
    turtle_species_threats,
    turtle_species_references
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
  const population = latestPopulation?.population_estimate ?? "Unknown";
  const populationTrend = latestPopulation?.population_trend || "Unknown";

  // Habitats / ecologies / regions
  const habitatString = turtle_species_habitats
    ?.map(h => h.habitats.habitat).join(", ") || "Unknown";
  const ecologyString = turtle_species_ecologies
    ?.map(e => e.ecologies.ecology).join(", ") || "Unknown";
  const regionString = turtle_species_regions_general
    ?.map(r => r.regions_general.region_name)
    .filter((name): name is string => name != null)
    .join(", ") || "Unknown";

  // Stats
  const stats = {
    population,
    populationTrend,
    habitat: habitatString,
    region: regionString,
    ecology: ecologyString,
    category: "Unknown"
  };

  // Measurements
  const measurementData = turtle_species_measurements?.[0];
  const measurements = measurementData
    ? {
        adultWeight: {
          value: measurementData.adult_weight,
          unit: 'g' as const // Database stores weight in grams
        },
        length: {
          female: {
            value: measurementData.length_female_max_scl,
            unit: 'cm' as const // Database stores length in centimeters
          },
          male: {
            value: measurementData.length_male_max_scl,
            unit: 'cm' as const
          },
          generallyLarger: measurementData.generally_larger || null
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
        adultWeight: { value: null, unit: 'g' as const },
        length: {
          female: { value: null, unit: 'cm' as const },
          male: { value: null, unit: 'cm' as const },
          generallyLarger: null
        },
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
    limitedInformation: {
      showWarning: limited_information_toggle === true,
      description: limited_information_description || "This species profile contains limited information and may be incomplete. Some sections may be missing data or require further research."
    },
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
      })) || [],
      ecologies: turtle_species_ecologies?.map(e => e.ecologies.ecology) || [],
      habitatTypes: turtle_species_habitat_types?.map(ht => ht.habitat_types?.habitat_type).filter(Boolean) || [],
      predators: sectionDescriptions?.predators || null
    },
    behavior: {
      diet: sectionDescriptions?.diet || null,
      hibernation: sectionDescriptions?.hibernation || null,
      nesting: sectionDescriptions?.nesting || null,
      uniqueTraits: sectionDescriptions?.unique_traits_and_qualities || null
    },
    conservation: {
      description: sectionDescriptions?.conservation || null,
      statuses: conservationStatuses || [],
      currentStatus: conservationStatus,
      threats: sectionDescriptions?.threats || null,
      threatTags: (() => {
        if (!turtle_species_threats || turtle_species_threats.length === 0) {
          return [];
        }
        // Handle both array and object cases for threats_list (Supabase can return either)
        const tags = turtle_species_threats
          .map(t => {
            const threatList = Array.isArray(t.threats_list) ? t.threats_list[0] : t.threats_list;
            if (!threatList || !threatList.threat_name) {
              return null;
            }
            return {
              name: threatList.threat_name,
              icon: threatList.icon || null
            };
          })
          .filter((tag): tag is { name: string; icon: string | null } => tag !== null);
        return tags;
      })()
    },
    behaviors: (() => {
      console.log('Transforming behaviors, raw data:', behaviors);
      if (!behaviors || behaviors.length === 0) {
        console.log('No behaviors data to transform');
        return [];
      }
      const transformed = behaviors.map(b => {
        console.log('Mapping behavior:', b);
        // Handle both array and object cases for behaviors_general
        const bg = Array.isArray(b.behaviors_general)
          ? b.behaviors_general[0]
          : b.behaviors_general;
        return {
          name: bg?.behavior || '',
          icon: bg?.behavior_icon || '',
          description: bg?.behavior_description || ""
        };
      });
      console.log('Transformed behaviors:', transformed);
      return transformed;
    })(),
    references: (() => {
      console.log('Transforming references, raw data:', turtle_species_references);
      if (!turtle_species_references || turtle_species_references.length === 0) {
        console.log('No references data to transform');
        return [];
      }
      console.log('References count:', turtle_species_references.length);
      return turtle_species_references.map(ref => ({
        id: ref.id,
        type: ref.reference_type || null,
        citationFull: ref.citation_full || null,
        citationShort: ref.citation_short || null,
        authors: ref.authors || null,
        year: ref.year || null,
        title: ref.title || null,
        sourceName: ref.source_name || null,
        url: ref.url || null,
        doi: ref.doi || null
      }));
    })()
  };
}

// Publicly exported functions:
export async function getTurtleData(slug: string) {
  try {
    const turtle = await fetchRawTurtleRow('slug', slug);
    if (!turtle) return null;

    const [relatedData, taxonomyData] = await Promise.all([
      fetchRelatedTurtleData(turtle),
      fetchTaxonomyData(
        turtle.tax_parent_genus,
        turtle.species_common_name,
        turtle.species_scientific_name
      )
    ]);

    const profileData = transformTurtleDataToProfile(turtle, {
      ...relatedData,
      conservationStatuses: relatedData.conservationStatuses
    });

    return {
      ...profileData,
      stats: {
        ...profileData.stats,
        // For now, show family common name as the "Category" in At a Glance
        category: taxonomyData?.family.common || 'Unknown'
      },
      taxonomy: taxonomyData
    };
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

    const [relatedData, taxonomyData] = await Promise.all([
      fetchRelatedTurtleData(turtle),
      fetchTaxonomyData(
        turtle.tax_parent_genus,
        turtle.species_common_name,
        turtle.species_scientific_name
      )
    ]);

    const profileData = transformTurtleDataToProfile(turtle, relatedData);

    return {
      ...profileData,
      taxonomy: taxonomyData
    };
  } catch (error) {
    console.error('Error in getTurtleDataByScientificName:', error);
    throw error;
  }
}
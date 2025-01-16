import { supabase } from '@/lib/db/supabaseClient'
import { getPhysicalFeatureImages } from '@/lib/db/cloudinary'

interface Variant {
  sex: string;
  lifeStage: string;
  value: string;
}

interface VariantData {
  sex: string;
  life_stage: string;
  [key: string]: any;
}

interface ConservationStatus {
  status: string;
  abbreviation: string;
}

interface ConservationHistory {
  year_status_assigned: string;
  conservation_statuses: ConservationStatus;
}

interface PopulationHistory {
  population_estimate?: number;
  population_trend?: string;
  year_of_estimate: string;
}

interface HabitatRow {
  habitats: {
    habitat: string;
  }
}

interface EcologyRow {
  ecologies: {
    ecology: string;
  }
}

interface Measurements {
  adult_weight: number;
  length_female_max_scl: number;
  length_male_max_scl: number;
  lifespan_wild_min: number;
  lifespan_wild_max: number;
  lifespan_captivity_min: number;
  lifespan_captivity_max: number;
}

interface SectionDescriptions {
  at_a_glance?: string;
  identification?: string;
}

interface PhysicalFeature {
  id: number;
  physical_feature: string;
  category: string;
  parent_feature?: number;
}

interface PhysicalFeatureData {
  id: number;
  sex: string;
  species_id: number;
  life_stage: string;
  [key: string]: any; // For dynamic feature columns
}

interface RelatedSpecies {
  commonName: string;
  scientificName: string;
  avatarUrl: string;
}

interface TurtleData {
  id: number;
  species_common_name: string;
  species_scientific_name: string;
  avatar_image_circle_url: string;
  avatar_image_full_url: string;
  tax_parent_genus: number;
  description: string;
  conservationStatus: {
    status: string;
    code: string;
    year: number;
  };
  stats: {
    population: string;
    populationTrend: string;
    habitat: string;
    region: string;
    ecology: string;
    category: string;
  };
  commonNames: string[];
  species_intro_description: string;
  other_common_names: string[];
  turtle_species_conservation_history?: ConservationHistory[];
  turtle_species_population_estimate_history?: PopulationHistory[];
  turtle_species_habitats?: HabitatRow[];
  turtle_species_ecologies?: EcologyRow[];
  turtle_species_measurements?: Measurements[];
  turtle_species_section_descriptions?: SectionDescriptions[];
  turtle_species_physical_features?: PhysicalFeatureData[];
  turtle_species_physical_features_key?: PhysicalFeature[];
  related_species?: RelatedSpecies[];
}

interface FeatureCategory {
  name: string;
  image?: { url: string };
  features: Feature[];
}

interface Feature {
  name: string;
  value: string;
  variants?: {
    reference: string;
    variants: Variant[];
  };
  subFeatures: { 
    name: string; 
    value: string;
    variants?: {
      reference: string;
      variants: Variant[];
    };
  }[];
}

function normalizeValue(value: any): string | null {
  // Special handling for boolean false
  if (value === false) {
    return 'false';
  }

  // Return null for empty/missing values to skip comparison
  if (!value || value === 'Unknown' || value === '-') {
    return null;
  }

  // Handle boolean values
  if (typeof value === 'boolean' || value === 'true' || value === 'false') {
    return String(value).toLowerCase();
  }

  // Handle array values
  if (Array.isArray(value)) {
    return value
      .map(v => v.toLowerCase().trim())
      .sort()
      .join(', ');
  }

  // Handle string array
  if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map(v => v.toLowerCase().trim())
          .sort()
          .join(', ');
      }
    } catch (e) {
      // Silent fail for parsing errors
    }
  }

  // Regular string
  return String(value).toLowerCase().trim().replace(/\s+/g, ' ');
}

export async function getTurtleData(slug: string) {
  try {
    // Fetch turtle data and related information in a single query
    const { data: turtle, error } = await supabase
      .from('turtle_species')
      .select(`
        id,
        species_common_name,
        species_scientific_name,
        species_intro_description,
        other_common_names,
        avatar_image_circle_url,
        avatar_image_full_url,
        tax_parent_genus,
        turtle_species_section_descriptions (
          at_a_glance,
          identification
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
          habitats(habitat)
        ),
        turtle_species_ecologies(
          ecologies(ecology)
        )
      `)
      .eq('slug', slug)
      .single<TurtleData>();

    if (error) {
      console.error('Error fetching turtle data:', error);
      throw error;
    }

    if (!turtle) return null;

    // Fetch images
    const categoryImages = await getPhysicalFeatureImages(turtle.species_common_name);

    // Fetch physical features and keys in parallel
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
      console.error('Error fetching physical features or keys:', physicalFeatures.error || featureKeys.error);
      throw physicalFeatures.error || featureKeys.error;
    }

    // Assign fetched data
    turtle.turtle_species_physical_features = physicalFeatures.data;
    turtle.turtle_species_physical_features_key = featureKeys.data;

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

    // Transform related species data
    const formattedRelatedSpecies = relatedSpecies?.map(species => ({
      commonName: species.species_common_name,
      scientificName: species.species_scientific_name,
      avatarUrl: species.avatar_image_full_url || '/images/image-placeholder.png'
    })) || [];

    // Extract and process data
    const {
      species_intro_description,
      other_common_names,
      turtle_species_conservation_history,
      turtle_species_population_estimate_history,
      turtle_species_habitats,
      turtle_species_ecologies
    } = turtle;

    // Process conservation status
    const latestConservation = turtle_species_conservation_history
      ?.sort((a, b) => b.year_status_assigned.localeCompare(a.year_status_assigned))[0];

    const conservationStatus = latestConservation
      ? {
          status: latestConservation.conservation_statuses.status,
          code: latestConservation.conservation_statuses.abbreviation,
          year: parseInt(latestConservation.year_status_assigned, 10) || 0
        }
      : {
          status: "Unknown",
          code: "NA",
          year: 0
        };

    // Process population data
    const latestPopulation = turtle_species_population_estimate_history
      ?.sort((a, b) => b.year_of_estimate.localeCompare(a.year_of_estimate))[0];

    const population = latestPopulation?.population_estimate
      ? latestPopulation.population_estimate.toLocaleString()
      : "Unknown";

    const populationTrend = latestPopulation?.population_trend || "Unknown";

    // Process habitats and ecologies
    const habitatString = turtle_species_habitats?.map(h => h.habitats.habitat).join(", ") || "Unknown";
    const ecologyString = turtle_species_ecologies?.map(e => e.ecologies.ecology).join(", ") || "Unknown";

    // Construct stats object
    const stats = {
      population,
      populationTrend,
      habitat: habitatString,
      region: "Unknown", // Placeholder
      ecology: ecologyString,
      category: "Unknown" // Placeholder
    };

    // Format measurements data
    const measurementData = turtle.turtle_species_measurements?.[0];
    const measurements = measurementData
      ? {
          adultWeight: measurementData.adult_weight ? `${measurementData.adult_weight} lbs` : 'Unknown',
          length: {
            female: measurementData.length_female_max_scl ? `${measurementData.length_female_max_scl} cm` : 'Unknown',
            male: measurementData.length_male_max_scl ? `${measurementData.length_male_max_scl} cm` : 'Unknown'
          },
          lifespan: {
            wild: measurementData.lifespan_wild_max ? `${measurementData.lifespan_wild_max} years` : 'Unknown',
            captivity: measurementData.lifespan_captivity_max ? `${measurementData.lifespan_captivity_max} years` : 'Unknown'
          }
        }
      : {
          adultWeight: 'Unknown',
          length: {
            female: 'Unknown',
            male: 'Unknown'
          },
          lifespan: {
            wild: 'Unknown',
            captivity: 'Unknown'
          }
        };

    // Get section descriptions
    const sectionDescriptions = turtle.turtle_species_section_descriptions?.[0];

    // Get reference variant (Adult Male)
    const referenceVariant = physicalFeatures.data?.find(
      variant => variant.sex === 'Male' && variant.life_stage === 'Adult'
    ) || physicalFeatures.data?.[0];

    // Group other variants
    const otherVariants = physicalFeatures.data?.filter(
      variant => !(variant.sex === 'Male' && variant.life_stage === 'Adult')
    );

    // Transform physical features into categories with variant data
    const featureCategories = (featureKeys.data || [])
      .filter(key => !key.parent_feature)
      .reduce<FeatureCategory[]>((acc, key) => {
        const category: FeatureCategory = acc.find((c) => c.name === key.category) || {
          name: key.category,
          image: undefined,
          features: []
        };

        if (!category.image) {
          const featureTag = key.category.toLowerCase().replace(/\//g, '-and-').replace(/\s+/g, '-');
          const categoryImage = categoryImages.find(img => img.tags.includes(featureTag));
          category.image = { url: categoryImage?.url || '/images/image-placeholder.png' };
        }

        const columnName = key.physical_feature.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
        const referenceValue = referenceVariant?.[columnName] || '-';

        // Check for variants with different values
        const variantDifferences = otherVariants?.reduce<Variant[]>((variants, variant) => {
          const variantValue = normalizeValue(variant[columnName]);
          const referenceNormalized = normalizeValue(referenceValue);
          
          if (variantValue && referenceNormalized && variantValue !== referenceNormalized) {
            variants.push({
              sex: variant.sex,
              lifeStage: variant.life_stage,
              value: variant[columnName]
            });
          }
          return variants;
        }, []);

        // Only include variants if differences exist
        const featureVariants = variantDifferences?.length ? {
          reference: referenceValue,
          variants: variantDifferences
        } : undefined;

        // Handle sub-features with the same variant logic
        const subFeatures = featureKeys.data
          .filter(subKey => subKey.parent_feature === key.id)
          .map(subKey => {
            const subColumnName = subKey.physical_feature.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
            const subReferenceValue = referenceVariant?.[subColumnName] || '-';

            const subVariantDifferences = otherVariants?.reduce<Variant[]>((variants, variant) => {
              const variantValue = normalizeValue(variant[subColumnName]);
              const referenceNormalized = normalizeValue(subReferenceValue);
              
              if (variantValue && referenceNormalized && variantValue !== referenceNormalized) {
                variants.push({
                  sex: variant.sex,
                  lifeStage: variant.life_stage,
                  value: variant[subColumnName]
                });
              }
              return variants;
            }, []);

            return {
              name: subKey.physical_feature,
              value: subReferenceValue,
              variants: subVariantDifferences?.length ? {
                reference: subReferenceValue,
                variants: subVariantDifferences
              } : undefined
            };
          });

        category.features.push({
          name: key.physical_feature,
          value: referenceValue,
          variants: featureVariants,
          subFeatures
        });

        if (!acc.find(c => c.name === key.category)) {
          acc.push(category);
        }

        return acc;
      }, []);

    const profileData = {
      commonName: turtle.species_common_name,
      scientificName: turtle.species_scientific_name,
      profileImage: turtle.avatar_image_circle_url || "",
      // ... other top level data
    };

    return {
      ...profileData,
      description: species_intro_description,
      conservationStatus,
      stats,
      commonNames: other_common_names || [],
      identification: {
        description: sectionDescriptions?.identification || "",
        physicalFeatures: "Physical features description...",
        measurements,
        featureCategories,
        speciesCard: {
          commonName: profileData.commonName,
          scientificName: profileData.scientificName,
          avatarUrl: profileData.profileImage,
          backgroundImageUrl: "/images/textures/grain-overlay.jpg",
          variant: {
            sex: "Male",
            lifeStage: "Adult"
          }
        },
        relatedSpecies: formattedRelatedSpecies
      }
    }
  } catch (error) {
    console.error('Error fetching turtle data:', error);
    throw error;
  }
}

export async function getTurtleDataByScientificName(scientificName: string) {
  try {
    const { data: turtle, error } = await supabase
      .from('turtle_species')
      .select(`
        id,
        species_common_name,
        species_scientific_name,
        species_intro_description,
        other_common_names,
        avatar_image_circle_url,
        avatar_image_full_url,
        tax_parent_genus,
        turtle_species_section_descriptions (
          at_a_glance,
          identification
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
          habitats(habitat)
        ),
        turtle_species_ecologies(
          ecologies(ecology)
        )
      `)
      .eq('species_scientific_name', scientificName)
      .single<TurtleData>();

    if (error) {
      console.error('Error fetching turtle data:', error);
      throw error;
    }

    if (!turtle) return null;

    // Fetch images
    const categoryImages = await getPhysicalFeatureImages(turtle.species_common_name);

    // Fetch physical features and keys in parallel
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
      console.error('Error fetching physical features or keys:', physicalFeatures.error || featureKeys.error);
      throw physicalFeatures.error || featureKeys.error;
    }

    // Assign fetched data
    turtle.turtle_species_physical_features = physicalFeatures.data;
    turtle.turtle_species_physical_features_key = featureKeys.data;

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

    // Transform related species data
    const formattedRelatedSpecies = relatedSpecies?.map(species => ({
      commonName: species.species_common_name,
      scientificName: species.species_scientific_name,
      avatarUrl: species.avatar_image_full_url || '/images/image-placeholder.png'
    })) || [];

    // Extract and process data
    const {
      species_intro_description,
      other_common_names,
      turtle_species_conservation_history,
      turtle_species_population_estimate_history,
      turtle_species_habitats,
      turtle_species_ecologies
    } = turtle;

    // Process conservation status
    const latestConservation = turtle_species_conservation_history
      ?.sort((a, b) => b.year_status_assigned.localeCompare(a.year_status_assigned))[0];

    const conservationStatus = latestConservation
      ? {
          status: latestConservation.conservation_statuses.status,
          code: latestConservation.conservation_statuses.abbreviation,
          year: parseInt(latestConservation.year_status_assigned, 10) || 0
        }
      : {
          status: "Unknown",
          code: "NA",
          year: 0
        };

    // Process population data
    const latestPopulation = turtle_species_population_estimate_history
      ?.sort((a, b) => b.year_of_estimate.localeCompare(a.year_of_estimate))[0];

    const population = latestPopulation?.population_estimate
      ? latestPopulation.population_estimate.toLocaleString()
      : "Unknown";

    const populationTrend = latestPopulation?.population_trend || "Unknown";

    // Process habitats and ecologies
    const habitatString = turtle_species_habitats?.map(h => h.habitats.habitat).join(", ") || "Unknown";
    const ecologyString = turtle_species_ecologies?.map(e => e.ecologies.ecology).join(", ") || "Unknown";

    // Construct stats object
    const stats = {
      population,
      populationTrend,
      habitat: habitatString,
      region: "Unknown", // Placeholder
      ecology: ecologyString,
      category: "Unknown" // Placeholder
    };

    // Format measurements data
    const measurementData = turtle.turtle_species_measurements?.[0];
    const measurements = measurementData
      ? {
          adultWeight: measurementData.adult_weight ? `${measurementData.adult_weight} lbs` : 'Unknown',
          length: {
            female: measurementData.length_female_max_scl ? `${measurementData.length_female_max_scl} cm` : 'Unknown',
            male: measurementData.length_male_max_scl ? `${measurementData.length_male_max_scl} cm` : 'Unknown'
          },
          lifespan: {
            wild: measurementData.lifespan_wild_max ? `${measurementData.lifespan_wild_max} years` : 'Unknown',
            captivity: measurementData.lifespan_captivity_max ? `${measurementData.lifespan_captivity_max} years` : 'Unknown'
          }
        }
      : {
          adultWeight: 'Unknown',
          length: {
            female: 'Unknown',
            male: 'Unknown'
          },
          lifespan: {
            wild: 'Unknown',
            captivity: 'Unknown'
          }
        };

    // Get section descriptions
    const sectionDescriptions = turtle.turtle_species_section_descriptions?.[0];

    // Get reference variant (Adult Male)
    const referenceVariant = physicalFeatures.data?.find(
      variant => variant.sex === 'Male' && variant.life_stage === 'Adult'
    ) || physicalFeatures.data?.[0];

    // Group other variants
    const otherVariants = physicalFeatures.data?.filter(
      variant => !(variant.sex === 'Male' && variant.life_stage === 'Adult')
    );

    // Transform physical features into categories with variant data
    const featureCategories = (featureKeys.data || [])
      .filter(key => !key.parent_feature)
      .reduce<FeatureCategory[]>((acc, key) => {
        const category: FeatureCategory = acc.find((c) => c.name === key.category) || {
          name: key.category,
          image: undefined,
          features: []
        };

        if (!category.image) {
          const featureTag = key.category.toLowerCase().replace(/\//g, '-and-').replace(/\s+/g, '-');
          const categoryImage = categoryImages.find(img => img.tags.includes(featureTag));
          category.image = { url: categoryImage?.url || '/images/image-placeholder.png' };
        }

        const columnName = key.physical_feature.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
        const referenceValue = referenceVariant?.[columnName] || '-';

        // Check for variants with different values
        const variantDifferences = otherVariants?.reduce<Variant[]>((variants, variant) => {
          const variantValue = normalizeValue(variant[columnName]);
          const referenceNormalized = normalizeValue(referenceValue);
          
          if (variantValue && referenceNormalized && variantValue !== referenceNormalized) {
            variants.push({
              sex: variant.sex,
              lifeStage: variant.life_stage,
              value: variant[columnName]
            });
          }
          return variants;
        }, []);

        // Only include variants if differences exist
        const featureVariants = variantDifferences?.length ? {
          reference: referenceValue,
          variants: variantDifferences
        } : undefined;

        // Handle sub-features with the same variant logic
        const subFeatures = featureKeys.data
          .filter(subKey => subKey.parent_feature === key.id)
          .map(subKey => {
            const subColumnName = subKey.physical_feature.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
            const subReferenceValue = referenceVariant?.[subColumnName] || '-';

            const subVariantDifferences = otherVariants?.reduce<Variant[]>((variants, variant) => {
              const variantValue = normalizeValue(variant[subColumnName]);
              const referenceNormalized = normalizeValue(subReferenceValue);
              
              if (variantValue && referenceNormalized && variantValue !== referenceNormalized) {
                variants.push({
                  sex: variant.sex,
                  lifeStage: variant.life_stage,
                  value: variant[subColumnName]
                });
              }
              return variants;
            }, []);

            return {
              name: subKey.physical_feature,
              value: subReferenceValue,
              variants: subVariantDifferences?.length ? {
                reference: subReferenceValue,
                variants: subVariantDifferences
              } : undefined
            };
          });

        category.features.push({
          name: key.physical_feature,
          value: referenceValue,
          variants: featureVariants,
          subFeatures
        });

        if (!acc.find(c => c.name === key.category)) {
          acc.push(category);
        }

        return acc;
      }, []);

    const profileData = {
      commonName: turtle.species_common_name,
      scientificName: turtle.species_scientific_name,
      profileImage: turtle.avatar_image_circle_url || "",
      // ... other top level data
    };

    return {
      ...profileData,
      description: species_intro_description,
      conservationStatus,
      stats,
      commonNames: other_common_names || [],
      identification: {
        description: sectionDescriptions?.identification || "",
        physicalFeatures: "Physical features description...",
        measurements,
        featureCategories,
        speciesCard: {
          commonName: profileData.commonName,
          scientificName: profileData.scientificName,
          avatarUrl: profileData.profileImage,
          backgroundImageUrl: "/images/textures/grain-overlay.jpg",
          variant: {
            sex: "Male",
            lifeStage: "Adult"
          }
        },
        relatedSpecies: formattedRelatedSpecies
      }
    }
  } catch (error) {
    console.error('Error fetching turtle data:', error);
    throw error;
  }
}

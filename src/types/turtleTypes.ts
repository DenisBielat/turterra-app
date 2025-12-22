export interface Variant {
    sex: string;
    lifeStage: string;
    value: unknown;
  }
  
  export interface VariantData {
    sex: string;
    life_stage: string;
    [key: string]: unknown;
  }
  
  export interface ConservationStatus {
    status: string;
    abbreviation: string;
  }
  
  export interface ConservationHistory {
    year_status_assigned: string;
    conservation_statuses: ConservationStatus;
  }
  
  export interface PopulationHistory {
    population_estimate?: number;
    population_trend?: string;
    year_of_estimate: string;
  }
  
  export interface HabitatRow {
    habitats: {
      habitat: string;
      icon: string;
    };
  }
  
  export interface EcologyRow {
    ecologies: {
      ecology: string;
    };
  }
  
  export interface HabitatTypeRow {
    habitat_types: {
      habitat_type: string;
    };
  }
  
  export interface BehaviorRow {
    behaviors_general: {
      behavior: string;
      behavior_icon: string;
      behavior_description?: string | null;
    };
  }
  
  export interface Measurements {
    adult_weight: number | null;
    length_female_max_scl: number | null;
    length_male_max_scl: number | null;
    lifespan_wild_min: number | null;
    lifespan_wild_max: number | null;
    lifespan_captivity_min: number | null;
    lifespan_captivity_max: number | null;
  }
  
  export interface SectionDescriptions {
    at_a_glance?: string;
    identification?: string;
    distribution?: string;
    habitat?: string;
    diet?: string;
    hibernation?: string;
    nesting?: string;
    unique_traits_and_qualities?: string;
    conservation?: string;
    predators?: string;
    threats?: string;
  }
  
  export interface ThreatRow {
    threats_list: {
      threat_name: string | null;
      icon: string | null;
    } | null;
  }
  
  export interface PhysicalFeature {
    id: number;
    physical_feature: string;
    category: string;
    parent_feature?: number | null;
  }
  
  export interface PhysicalFeatureData {
    id: number;
    species_id: number;
    sex: string;         // e.g. "Male", "Female"
    life_stage: string;  // e.g. "Adult", "Juvenile"
    [key: string]: unknown;  // For dynamic columns like color, shape, etc.
  }
  
  export interface RelatedSpecies {
    commonName: string;
    scientificName: string;
    avatarUrl: string;
    avatarCircleUrl?: string;
    conservationStatus?: string;
  }
  
  export interface TurtleData {
    id: number;
    species_common_name: string;
    species_scientific_name: string;
    species_intro_description?: string; // Optional since it might not exist in DB
    other_common_names: string[];
    avatar_image_circle_url: string | null;
    avatar_image_full_url: string | null;
    tax_parent_genus: number;
    // The next fields often get attached programmatically in the transform
    turtle_species_section_descriptions?: SectionDescriptions[];
    turtle_species_measurements?: Measurements[];
    turtle_species_conservation_history?: ConservationHistory[];
    turtle_species_population_estimate_history?: PopulationHistory[];
    turtle_species_habitats?: HabitatRow[];
    turtle_species_ecologies?: EcologyRow[];
    turtle_species_habitat_types?: HabitatTypeRow[];
    turtle_species_behaviors_general?: BehaviorRow[];
    turtle_species_physical_features?: PhysicalFeatureData[];
    turtle_species_physical_features_key?: PhysicalFeature[];
    turtle_species_threats?: ThreatRow[];
    related_species?: RelatedSpecies[];
  }
  
  // For the shape you ultimately return to the front-end (if different)
  export interface ProfileData {
    id: number;
    commonName: string;
    scientificName: string;
    profileImage: string;
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
    identification: {
      description: string;
      physicalFeatures: string;
      measurements: {
        adultWeight: string;
        length: { female: string; male: string };
        lifespan: { wild: string; captivity: string };
      };
      featureCategories: FeatureCategory[];
      speciesCard: {
        commonName: string;
        scientificName: string;
        avatarUrl: string;
        backgroundImageUrl: string;
        variant: { sex: string; lifeStage: string };
      };
      relatedSpecies: RelatedSpecies[];
    };
    distributionText?: string | null;
    habitat: {
      description: string;
      habitats: Array<{
        name: string;
        icon: string;
      }>;
      ecologies: string[];
      habitatTypes: string[];
      predators: string | null;
    };
    behavior: {
      diet: string | null;
      hibernation: string | null;
      nesting: string | null;
      uniqueTraits: string | null;
    };
    conservation: {
      description: string | null;
      statuses: Array<{
        id: string;
        status: string;
        abbreviation: string;
        definition?: string | null;
        order_of_concern?: number | null;
      }>;
      currentStatus: {
        status: string;
        code: string;
        year: number;
      };
      threats: string | null;
      threatTags: Array<{
        name: string;
        icon: string | null;
      }>;
    };
    behaviors: Array<{
      name: string;
      icon: string;
      description: string;
    }>;
  }
  
  export interface FeatureCategory {
    name: string;
    features: Feature[];
    image?: { url: string };
  }
  
  export interface FeatureVariants {
    reference: string;
    variants: Variant[];
  }
  
  export interface Feature {
    name: string;
    value: string;
    variants?: FeatureVariants;
    subFeatures: SubFeature[];
    images?: { url: string }[];
  }
  
  export interface SubFeature {
    name: string;
    value: string;
    variants?: FeatureVariants;
  }
  
  export interface ComparisonSpecies {
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
    featureCategories: FeatureCategory[];
  }
  
  export interface SpeciesComparisonProps {
    primarySpecies: ComparisonSpecies;
    primarySpeciesId?: number;
    comparisonSpecies?: ComparisonSpecies;
    relatedSpecies: RelatedSpecies[];
  }
  
  export interface PhysicalFeaturesProps {
    categories: FeatureCategory[];
    openCategory: string;
    onCategoryClick: (categoryName: string, isOpen: boolean) => void;
  }

  export interface SpeciesCardProps {
    commonName: string;
    scientificName: string;
    avatarUrl: string;
    backgroundImageUrl?: string;
    variant: {
      sex: string;
      lifeStage: string;
    };
    isComparison?: boolean;
    onRemove?: () => void;
  }

  export interface VariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
    variants: FeatureVariants;
  }
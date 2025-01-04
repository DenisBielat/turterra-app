import { supabase } from '@/lib/db/supabaseClient'

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

interface TurtleData {
  species_common_name: string;
  species_scientific_name: string;
  avatar_image_url: string;
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
}


export async function getTurtleData(slug: string) {
  const { data: turtle, error } = await supabase
    .from('turtle_species')
    .select(`
      id,
      species_common_name,
      species_scientific_name,
      species_intro_description,
      other_common_names,
      avatar_image_url,
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

  if (error) throw error

  if (!turtle) return null

  // Extract the data we need
  const {
    species_intro_description,
    other_common_names,
    turtle_species_conservation_history,
    turtle_species_population_estimate_history,
    turtle_species_habitats,
    turtle_species_ecologies
  } = turtle

  // Handle Conservation Status:
  // Sort by year_status_assigned descending and take the first
  const latestConservation = turtle_species_conservation_history
    ?.sort((a, b) => b.year_status_assigned.localeCompare(a.year_status_assigned))[0]

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
      }

  // Handle Population Data:
  // Sort by year_of_estimate descending and take the first
  const latestPopulation = turtle_species_population_estimate_history
    ?.sort((a, b) => b.year_of_estimate.localeCompare(a.year_of_estimate))[0]

  const population = latestPopulation?.population_estimate
    ? latestPopulation.population_estimate.toLocaleString()
    : "Unknown"

  const populationTrend = latestPopulation?.population_trend || "Unknown"

  // Handle Habitats:
  const habitats = turtle_species_habitats?.map(h => h.habitats.habitat) || []
  const habitatString = habitats.length > 0 ? habitats.join(", ") : "Unknown"

  // Handle Ecologies:
  const ecologies = turtle_species_ecologies?.map(e => e.ecologies.ecology) || []
  const ecologyString = ecologies.length > 0 ? ecologies.join(", ") : "Unknown"

  // For region and category, since we don't have those tables defined here,
  // you can either hardcode or handle them similarly. For now, let's just say "Unknown":
  const region = "Unknown"
  const category = "Unknown"

  // Construct stats object in the same shape as before
  const stats = {
    population,
    populationTrend,
    habitat: habitatString,
    region,
    ecology: ecologyString,
    category
  }

  // Format measurements data
  const measurementData = turtle.turtle_species_measurements?.[0];  // Get first element
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
        length: {
          female: 'Unknown',
          male: 'Unknown'
        },
        lifespan: {
          wild: 'Unknown',
          captivity: 'Unknown'
        }
      };

  // Get the first (and should be only) section description object
  const sectionDescriptions = turtle.turtle_species_section_descriptions?.[0];

  return {
    commonName: turtle.species_common_name,
    scientificName: turtle.species_scientific_name,
    profileImage: turtle.avatar_image_url || "",
    description: species_intro_description,
    conservationStatus,
    stats,
    commonNames: other_common_names || [],
    identification: {
      description: sectionDescriptions?.identification || "",
      physicalFeatures: "Congue nec diam sollicitudin vel primis interdum ex. Rutrum imperdiet nisl, litora conubia luctus curae facilisi morbi. Proin magna scelerisque phasellus placerat, himenaeos euismod neque.",
      measurements
    }
  }
}

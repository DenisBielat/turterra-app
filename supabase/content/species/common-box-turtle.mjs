// Common Box Turtle, Terrapene carolina (species)
//
// Sources read for this profile:
//   kiester2015  the IUCN SSC specialist group's species account (25 pp.)
//   ttwg2025     the entry for Terrapene carolina in the 2025 world checklist
//
// IMPORTANT when revising: the 2015 account treats Terrapene carolina as six
// subspecies. The 2025 checklist, which Turterra follows, keeps three
// (carolina, bauri, major); triunguis, mexicana and yucatana are now separate
// species. Statements in the account that rest on those three forms have been
// left out (for example the 115 mm lower size limit, the 73-year age record,
// fire ants as a predator, and everything about Mexico). In the account,
// "Eastern Box Turtle" means the whole species; its name for T. c. carolina is
// "Woodland Box Turtle".
//
// Page numbers below are pages of the account (p.1 = 085.1).

const references = {
  kiester2015: {
    type: 'TFTSG Account',
    citationFull:
      'Kiester, A.R. and Willey, L.L. 2015. Terrapene carolina (Linnaeus 1758) – Eastern Box Turtle, Common Box Turtle. In: Rhodin, A.G.J., Pritchard, P.C.H., van Dijk, P.P., Saumure, R.A., Buhlmann, K.A., Iverson, J.B., and Mittermeier, R.A. (Eds.). Conservation Biology of Freshwater Turtles and Tortoises: A Compilation Project of the IUCN/SSC Tortoise and Freshwater Turtle Specialist Group. Chelonian Research Monographs 5(8):085.1–25, doi:10.3854/crm.5.085.carolina.v1.2015, http://www.iucn-tftsg.org/cbftt/.',
    citationShort: 'Kiester and Willey 2015',
    authors: 'Kiester, A.R. and Willey, L.L.',
    year: 2015,
    title: 'Terrapene carolina (Linnaeus 1758) – Eastern Box Turtle, Common Box Turtle',
    sourceName: 'Chelonian Research Monographs No. 5',
    url: 'https://iucn-tftsg.org/cbftt/species-accounts/terrapene-carolina-085/',
    doi: '10.3854/crm.5.085.carolina.v1.2015',
    accessDate: '2026-11-18',
  },
  ttwg2025: {
    type: 'Book',
    citationFull:
      'Turtle Taxonomy Working Group [Rhodin, A.G.J., Iverson, J.B., Fritz, U., Gallego-García, N., Georges, A., Shaffer, H.B., and van Dijk, P.P.]. 2025. Turtles of the World: Annotated Checklist and Atlas of Taxonomy, Synonymy, Distribution, and Conservation Status (10th Ed.). In: Rhodin, A.G.J., Iverson, J.B., van Dijk, P.P., Stanford, C.B., Goode, E.V., Buhlmann, K.A., and Mittermeier, R.A. (Eds.). Conservation Biology of Freshwater Turtles and Tortoises: A Compilation Project of the IUCN SSC Tortoise and Freshwater Turtle Specialist Group. Chelonian Research Monographs 10:1–575. doi:10.3854/crm.10.checklist.atlas.v10.2025.',
    citationShort: 'TTWG 2025',
    authors: 'Turtle Taxonomy Working Group [Rhodin, A.G.J., Iverson, J.B., Fritz, U., Gallego-García, N., Georges, A., Shaffer, H.B., and van Dijk, P.P.]',
    year: 2025,
    title: 'Turtles of the World: Annotated Checklist and Atlas of Taxonomy, Synonymy, Distribution, and Conservation Status (10th Ed.)',
    sourceName: 'Chelonian Research Monographs No. 10',
    url: 'https://iucn-tftsg.org/checklists/turtles-of-the-world-checklist-10th-edition/',
    doi: '10.3854/crm.10.checklist.atlas.v10.2025',
    accessDate: '2026-11-18',
  },
  vanDijk2011: {
    type: 'IUCN Assessment',
    citationFull: 'van Dijk, P.P. 2011. Terrapene carolina. The IUCN Red List of Threatened Species 2011: e.T21641A9303747.',
    citationShort: 'van Dijk 2011 (IUCN)',
    authors: 'van Dijk, P.P.',
    year: 2011,
    title: 'Terrapene carolina',
    sourceName: 'The IUCN Red List of Threatened Species',
    url: 'https://www.iucnredlist.org/species/21641/9303747',
    accessDate: '2026-11-18',
    notes:
      'Category, criteria and year are given as reported in TTWG 2025 and Kiester and Willey 2015; the assessment itself was not read. It was made when the species also included forms now treated as separate species.',
  },
};

const species = {
  scientificName: 'Terrapene carolina',
  commonName: 'Common Box Turtle',
  otherCommonNames: ['American Box Turtle'], // the name used by TTWG 2025
  rank: 'species',
  genus: 'Terrapene',
  limitedInformation: null,
  references,

  text: {
    // p.1 (summary); TTWG species heading (three subspecies; IUCN line)
    at_a_glance: {
      sources: ['kiester2015', 'ttwg2025'],
      body: `The Common Box Turtle is a small land turtle of the eastern United States, best known for the hinged lower shell that lets it shut itself completely inside. Three subspecies are recognised: the Eastern, Florida and Gulf Coast Box Turtles. It lives in a patchwork of forest, clearings and fields, eats almost anything, and can live for many decades. Once thought of as common, it has declined across its range and has been listed as Vulnerable on the IUCN Red List since 2011. Loss of habitat, deaths on roads and collection for the pet trade are the main causes.`,
    },

    // pp.4-5 (description, sexual dimorphism, hatchlings); TTWG "Size (Max SCL)" lines
    identification: {
      sources: ['kiester2015', 'ttwg2025'],
      body: `The feature that defines a box turtle is its movable plastron, the lower shell. A hinge lets the turtle pull the plastron up against the carapace and close the shell completely and securely. In one anatomical comparison, box turtles had the most advanced closing mechanism of the related turtles examined.

The carapace has a keel along the midline and is deepest behind the hinge. Colour and pattern vary enormously, between the subspecies and within each of them. Shells range from brown to black, with yellow, orange or white stripes or splashes, and old Gulf Coast Box Turtles can turn almost uniformly black. Hatchlings often have a single light dot in the centre of each scute.

Males often have a larger tail, with the vent set further back, and a more concave plastron than females. They are usually the more brightly coloured sex, except in the Florida and Gulf Coast subspecies, where males may instead have white or blue heads. Many males have a bright red iris and most females a brown one, but some females have red eyes too, so eye colour alone does not settle the sex. Young animals cannot be sexed from the outside.

The longest shells on record are 23.5 cm for a male, a captive Gulf Coast Box Turtle, and 19.8 cm for a female, an Eastern Box Turtle. Size differs between the subspecies, and so does which sex grows larger.`,
    },

    // TTWG distribution lists (species and each subspecies); pp.5-6 (range-edge states, Ontario)
    distribution: {
      sources: ['ttwg2025', 'kiester2015'],
      body: `The Common Box Turtle is found across the eastern United States. The 2025 checklist of the world's turtles records it from 25 states: from Maine, New Hampshire and Massachusetts south to Florida, and west to Michigan, Illinois, Tennessee, Mississippi and Louisiana.

The Eastern Box Turtle occupies most of that range. The Florida Box Turtle is restricted to Florida, and the Gulf Coast Box Turtle is recorded from Alabama, Florida, Georgia, Louisiana and Mississippi. Where the ranges of the subspecies overlap they intergrade.

The species has been lost from the northern edge of its range. The checklist lists it as extirpated from Ontario, and Canada's wildlife status committee designated it Extirpated in 2014; recent sightings there have been single animals, probably released pets. A 2015 review also found no known functioning populations left in Maine or New Hampshire.`,
    },

    // pp.7-8, 10 (habitat, aquatic use, intermediate disturbance, nesting and juvenile habitat)
    habitat: {
      sources: ['kiester2015'],
      body: `Common Box Turtles live mainly on land. They use forest, open woodland, fields and streamside areas, and they favour forest broken by natural or man-made openings over continuous closed canopy. Open, early-successional and grassy areas matter at certain times of year. Nesting females look for open ground with sandy soil and little vegetation or leaf litter, often in clearings made by people, and hatchlings and juveniles shelter around fallen trees and coarse woody debris.

Habitat use differs from place to place and from one turtle to the next. The Gulf Coast Box Turtle is the most aquatic of the three subspecies and lives in marshes and pine-palmetto forest. Other box turtles also enter water at times, more often in warm climates and during hot, dry weather.

Because the species depends on a shifting mosaic of forest, openings and fields, it is thought to be suited to a moderate level of disturbance: too much leaves only open ground, and too little leaves closed forest that is too dark.`,
    },

    // p.8-9 (diet, seed and spore dispersal)
    diet: {
      sources: ['kiester2015'],
      body: `Common Box Turtles are highly omnivorous and eat an extraordinary variety of food. Recorded items include berries and other fruits, mushrooms, snails, slugs, insects, earthworms and carrion, and now and then a small vertebrate. What they eat changes with the season and may change as they grow, and turtles sometimes gather where food is locally plentiful.

Because they eat so many fruits and fungi and then move on, box turtles may be important in spreading seeds and fungal spores through their habitat.`,
    },

    // p.8-9 (dormancy, overwintering sites, freeze tolerance, daily activity)
    hibernation: {
      sources: ['kiester2015'],
      body: `Across most of its range the Common Box Turtle spends the winter dormant. In the north, turtles are active from about April to October or November. Further south the active season is longer, and Florida Box Turtles have been found active in every month of the year.

Most turtles overwinter in forest, burrowed into leaf litter and soil, which stay much warmer than the air. They choose spots that are warmer than their surroundings, and often use stump holes and the pits left by fallen trees. The wintering site may lie outside the area a turtle uses in summer, and many turtles may gather where conditions are suitable.

Laboratory studies have shown that box turtles can survive some freezing: in one experiment a turtle's heart stopped for 25 hours at -2.1 °C and started beating again when it thawed. Even so, some turtles die over winter.

During the active season box turtles are active by day. In warm weather they move in the morning and again in late afternoon, resting through the midday heat, and they are most active when it is warm and humid or after rain.`,
    },

    // pp.10-11 (reproduction)
    nesting: {
      sources: ['kiester2015'],
      body: `Mating can take place at any time during the active season. Most box turtles mate on land, but the Gulf Coast Box Turtle customarily mates in water. Females can store sperm and lay fertile eggs long after their last contact with a male.

Nesting usually happens in the evening. Outside Florida, nests are typically dug from late May to early July; in Florida, females have been found carrying shelled eggs from late March to early August. Females choose open ground with sandy soil and little plant cover.

Clutches are small. Florida Box Turtles average fewer than three eggs, while Eastern Box Turtles studied in New York, Illinois and Massachusetts averaged more than five. Two or three clutches a year have often been reported, but near the northern edge of the range females have not been seen to lay more than one.

Reported incubation periods run from 57 to 136 days. Hatchlings typically emerge from late August to early September, though some stay in the nest over winter. In Eastern Box Turtles from Indiana, incubation temperature decided the sex of the hatchlings, with cooler eggs producing males and warmer eggs females.`,
    },

    // pp.5, 9, 10, 11 (closure, longevity, homing, behavioural fever, long-term studies); TTWG genus etymology
    unique_traits_and_qualities: {
      sources: ['kiester2015', 'ttwg2025'],
      body: `Few turtles can shut themselves in as completely as a box turtle.

Box turtles are also very long-lived. Turtles found again decades after someone carved a date into their shell point to ages from 46 to more than 100 years, though these are estimates and not verified records. In one long-studied population in Maryland, females were still breeding when well past 50.

They are known to find their way home when moved, although how they navigate is not understood. Eastern Box Turtles also show a behavioural fever: a sick turtle will warm itself above its normal temperature.

The genus name Terrapene comes from a Powhatan word for a turtle, the same root as "terrapin".

Box turtles are among the best understood of all long-lived reptiles, thanks to long-term field studies. The oldest began in Maryland in 1945 and was approaching its 70th year when the species was last reviewed.`,
    },

    // TTWG species heading (IUCN, CITES); pp.11-12, 15-17 (state listings, trends, measures)
    conservation: {
      sources: ['ttwg2025', 'kiester2015', 'vanDijk2011'],
      body: `The Common Box Turtle is listed as Vulnerable on the IUCN Red List (criteria A2bcde+4bcde, assessed in 2011); before that it was listed as Near Threatened. The assessment was made when the species was defined more broadly and included box turtles that are now treated as separate species. All box turtles of the genus Terrapene have been listed on Appendix II of CITES since 1995.

In Canada the species is designated Extirpated. In the United States protection varies by state. As of 2015 it was listed as a species of Special Concern in Connecticut, Indiana, Massachusetts, Michigan, New Hampshire, New Jersey, New York and Ohio, as Protected in Rhode Island and as Endangered in Maine, and many states had closed or limited commercial collecting.

Long-term studies show why there is concern. At a protected site in Maryland the population in 1995 was 23% of what it had been in 1955, and a population in Indiana fell from 4.4–5.7 turtles per hectare in the 1960s to 2.7 in 1983. Of the five populations whose long-term trends had been evaluated by 2015, only one, of Florida Box Turtles, had stayed stable.

Researchers recommend large reserves (one translocated population in Pennsylvania needed at least 800 hectares to contain its movements), land management timed to avoid killing turtles, and coordinated long-term monitoring. The Gulf Coast Box Turtle has never been the subject of a population study.`,
    },

    // p.11 (predators, survival)
    predators: {
      sources: ['kiester2015'],
      body: `Recorded predators of box turtles include bald eagles, hogs and snakes, and chipmunks are suspected of taking juveniles. The share of nests lost to predators varies from none to all of them.

Predation probably matters more for young turtles than for adults. In most studied populations between 81% and 96% of adults survive from one year to the next, although one Florida population had an annual survival rate as low as 56%. Predation is not thought to be a major cause of decline unless a population is already under stress or predators are unusually numerous.`,
    },

    // pp.11, 13-15 (threats)
    threats: {
      sources: ['kiester2015'],
      body: `Habitat loss is the underlying threat. Between 1973 and 2000 an estimated 3.7 million hectares of eastern forest, about 4% of the total, were lost or converted to other uses, and what remains is increasingly fragmented. Where the landscape has become urban or densely suburban, box turtles have dwindled or disappeared.

Roads kill turtles and divide populations. A box turtle's own defence may make things worse, because it closes its shell when threatened and stays closed for longer than other turtles. Females searching for nest sites may be hit hardest, and at two long-studied sites the sex ratio became more male-biased as the population declined.

Mowing and haying kill turtles in fields, and so does fire: in Florida, wet-season fires may kill 10–21% of the box turtles in the area burned.

Collection is another drain. An informal U.S. Fish and Wildlife Service estimate reported in 1994 put exports of North American box turtles, this species and the Ornate Box Turtle together, at more than 35,000 a year. A 2007 study counted more than 520 turtle races a year in the United States and estimated that 26,000 box turtles are taken from the wild annually to take part.

Ranavirus in wild and captive box turtles is a growing concern, and released pets may carry disease and non-local genes into wild populations.`,
    },
  },

  measurements: {
    adult_weight: null,
    length_female_max_scl: 19.8,
    length_male_max_scl: 23.5,
    generally_larger: null,
    lifespan_wild_min: null,
    lifespan_wild_max: null,
    lifespan_captivity_min: null,
    lifespan_captivity_max: null,
    sources: {
      length_female_max_scl: ['ttwg2025'],
      length_male_max_scl: ['ttwg2025'],
    },
  },

  conservation: [
    { status: 'VU', year: 2011, date: null, sources: ['ttwg2025', 'vanDijk2011'] },
  ],
  population: [
    { year: 2015, estimate: null, trend: 'Decreasing', sources: ['kiester2015'] },
  ],

  habitats: ['Forests', 'Forest Openings & Edges', 'Fields & Grasslands', 'Riparian Areas', 'Wetlands & Marshes'],
  ecologies: ['Terrestrial'],
  habitatTypes: ['Forests', 'Grasslands', 'Inland Wetlands'],
  regions: ['Eastern United States', 'Southeastern United States'],
  threats: ['Deforestation', 'Urbanization', 'Infrastructure Development', 'Collection/Pet Trade', 'Agriculture', 'Controlled Burns'],
  behaviors: ['Diurnal'],
  newVocabulary: {
    habitats: ['Forests', 'Forest Openings & Edges', 'Fields & Grasslands', 'Riparian Areas'],
    habitatTypes: ['Forests'],
  },
  tagSources: ['kiester2015', 'ttwg2025'],

  // Only what the sources state. They describe the species in general terms
  // and refer readers elsewhere for full descriptions, so most fields are empty.
  physicalFeatures: [
    {
      life_stage: 'adult', sex: null, sources: ['kiester2015'],
      values: {
        carapace_shape: 'keeled; deepest behind the plastral hinge',
        carapace_pattern: 'highly variable; stripes or splashes',
        carapace_colors: 'brown to black with yellow, orange or white markings; almost uniformly black in old Gulf Coast Box Turtles',
        marginal_scute_shape: 'first marginal scute rectangular',
        vertebral_keel: 'present',
        hinge_present: 'true',
        hinge_location: 'plastron',
      },
    },
    {
      life_stage: 'adult', sex: 'male', sources: ['kiester2015'],
      values: {
        head_colors: 'may be white or blue in Florida and Gulf Coast Box Turtles',
        eye_color: 'iris often bright red',
        tail_length: 'larger than the female\'s, with the vent further back',
        carapace_shape: 'keeled; deepest behind the plastral hinge',
        carapace_pattern: 'highly variable; stripes or splashes',
        carapace_colors: 'brown to black with yellow, orange or white markings; almost uniformly black in old Gulf Coast Box Turtles',
        marginal_scute_shape: 'first marginal scute rectangular',
        vertebral_keel: 'present',
        hinge_present: 'true',
        hinge_location: 'plastron',
      },
    },
    {
      life_stage: 'adult', sex: 'female', sources: ['kiester2015'],
      values: {
        eye_color: 'iris usually brown, occasionally red',
        tail_length: 'smaller than the male\'s',
        carapace_shape: 'keeled; deepest behind the plastral hinge',
        carapace_pattern: 'highly variable; stripes or splashes',
        carapace_colors: 'brown to black with yellow, orange or white markings; almost uniformly black in old Gulf Coast Box Turtles',
        marginal_scute_shape: 'first marginal scute rectangular',
        vertebral_keel: 'present',
        hinge_present: 'true',
        hinge_location: 'plastron',
      },
    },
    {
      life_stage: 'hatchling', sex: null, sources: ['kiester2015'],
      values: {
        carapace_pattern: 'often a single light dot in the centre of each scute',
        carapace_colors: 'dark with light dots',
      },
    },
  ],

  // Sources that would fill what is empty here. Added to /admin/follow-ups when
  // this file's SQL is run; after that they are managed there.
  followUps: [
    {
      kind: 'book',
      taxa: ['Terrapene'],
      title:
        'Dodd, C.K., Jr. 2001. North American Box Turtles: A Natural History. Norman, OK: University of Oklahoma Press, 231 pp.',
      wouldFill:
        'Physical descriptions of each subspecies (head, neck, limbs, claws, plastron, bridge, where the hinge sits), which the profiles leave empty. Check it too for body mass and lifespan, also empty.',
      notes:
        'Kiester and Willey 2015 call it a comprehensive book on the genus and say it and Milstead 1969 give "differential diagnoses and complete descriptions of the subspecies and their variation". No ebook edition, so it means a print copy: pages can be photographed and sent for transcription.',
    },
    {
      kind: 'paper',
      taxa: ['Terrapene'],
      title:
        'Milstead, W.W. 1969. Studies on the evolution of box turtles (genus Terrapene). Bulletin of the Florida State Museum, Biological Sciences Series 14:1–113.',
      wouldFill:
        'Diagnoses and descriptions of the subspecies, for the physical-feature fields the profiles leave empty.',
      notes:
        'Cited by Kiester and Willey 2015 alongside Dodd 2001 for complete descriptions of the subspecies. A museum bulletin, so it may be free to read online; not yet looked for.',
    },
  ],

  notes: [
    'Physical features are sparse: neither source gives a full description (the account refers readers to Milstead 1969 and Dodd 2001). Head, neck, limb, claw, plastron and bridge details, and where on the plastron the hinge sits, need a descriptive source before they can be filled in.',
    'Weight and lifespan are left empty. The sources give no body mass. For lifespan they give estimates (46 to over 100 years from dates carved on shells; breeding females past 50) but no verified maximum; say if you would rather show a figure.',
    '"Generally larger" is left empty: the account says only that size dimorphism varies by subspecies. In the checklist\'s record lengths the male is larger in the Florida and Gulf Coast subspecies and the female in the Eastern.',
    'The general colour description and the food list come from statements the 2015 account makes about the species when it still included three forms that are now separate species. They are not broken down by subspecies.',
    'The freeze-tolerance experiments are reported for "Terrapene carolina" without naming the subspecies.',
    'The 35,000-a-year export figure covers this species and the Ornate Box Turtle together and is an informal estimate reported in a 1994 newspaper article; the 26,000-a-year figure for turtle races (Heeb 2007, a workshop abstract) is for box turtles in general.',
    'The Red List assessment (2011) was made on the broader species. State listings are as of the 2015 account and may have changed.',
    'New tags proposed: habitats "Forests", "Forest Openings & Edges", "Fields & Grasslands", "Riparian Areas"; habitat type "Forests". No threat tag exists for road deaths (tagged under Infrastructure Development) or for disease.',
    'Not written: range map (needs the IUCN range file) and photos.',
  ],
};

export default species;

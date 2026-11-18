// Eastern Box Turtle, Terrapene carolina carolina (subspecies of the Common Box Turtle)
//
// Sources read for this profile:
//   kiester2015  the IUCN SSC specialist group's account of Terrapene carolina (25 pp.)
//   ttwg2025     the entry for T. c. carolina in the 2025 world checklist
//
// IMPORTANT when revising: in the 2015 account "Eastern Box Turtle" means the
// whole species, in a sense that then included six subspecies. Its name for
// this subspecies is "Woodland Box Turtle". Only statements the account ties
// to T. c. carolina, or to a study site inside its range (the state is named
// in the text below), have been used here. General statements about the
// species are on the Common Box Turtle profile, not repeated here.
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
      'Species-level assessment; the Eastern Box Turtle has no assessment of its own. Category, criteria and year are given as reported in TTWG 2025 and Kiester and Willey 2015; the assessment itself was not read.',
  },
};

const species = {
  scientificName: 'Terrapene carolina carolina',
  commonName: 'Eastern Box Turtle',
  otherCommonNames: ['Woodland Box Turtle'], // TTWG 2025 and Kiester and Willey 2015
  rank: 'subspecies',
  parent: 'Terrapene carolina',
  genus: 'Terrapene',
  limitedInformation: null,
  references,

  text: {
    // p.1 (summary: nominate subspecies widely distributed and well known); TTWG T. c. carolina heading
    at_a_glance: {
      sources: ['kiester2015', 'ttwg2025'],
      body: `The Eastern Box Turtle, also called the Woodland Box Turtle, is the most widespread of the three subspecies of the Common Box Turtle and one of the best-known turtles in the world. It is a small land turtle of the eastern United States, recorded from New England to northern Florida and west to Michigan and Illinois, that can close its hinged shell completely. Decades of field study have shown it to be long-lived, with females still breeding past the age of 50. Populations at several long-studied sites have declined, and it has disappeared from the northern edge of its range.`,
    },

    // pp.4-5 (group-level description, sexual dimorphism, hatchling Fig. 4); TTWG size line and synonym etymologies
    identification: {
      sources: ['kiester2015', 'ttwg2025'],
      body: `Like all box turtles, the Eastern Box Turtle has a hinged plastron and can close its shell completely. The carapace is keeled along the midline and deepest behind the hinge. Colour and pattern differ greatly from one animal to the next. The shell is dark, brown to black, marked with light lines, spots or blotches in yellow, orange or white. Hatchlings often have a single yellow dot in the centre of each scute.

Males often have a larger tail, a vent set further back and a more concave plastron than females, and they are usually the more brightly coloured sex. Many males have a bright red iris and most females a brown one, but some females have red eyes too, so eye colour is a hint and not a rule. Immature animals cannot be sexed by eye.

The longest shell on record is 19.8 cm, listed for a female and matching a 198 mm animal from a New York population that averaged only 133 mm. The largest male on record measured 17.4 cm.`,
    },

    // TTWG T. c. carolina distribution list and AOO; pp.1, 4, 5-7 (range, range edge, islands, contact zone)
    distribution: {
      sources: ['ttwg2025', 'kiester2015'],
      body: `The Eastern Box Turtle has by far the largest range of the three subspecies. The 2025 checklist records it from 24 states: Alabama, Connecticut, Delaware, Florida, Georgia, Illinois, Indiana, Kentucky, Maine, Maryland, Massachusetts, Michigan, Mississippi, New Hampshire, New Jersey, New York, North Carolina, Ohio, Pennsylvania, Rhode Island, South Carolina, Tennessee, Virginia and West Virginia. In the southern states it reaches only the northern parts of Florida, Alabama and Mississippi, and in the west it reaches southern Illinois. Its estimated historical area of occupancy is about 1.4 million square kilometres. It sometimes occurs on offshore islands.

Further south it meets the Florida and Gulf Coast Box Turtles, and where their ranges overlap the subspecies intergrade.

At the northern edge the turtle has been lost. It is listed as extirpated from Ontario, where recent sightings have been single animals that were probably released pets, and a 2015 review found no known functioning populations left in Maine or New Hampshire.`,
    },

    // pp.7-10 (habitat studies at carolina sites; forms; home range)
    habitat: {
      sources: ['kiester2015'],
      body: `Eastern Box Turtles live in a mix of forest, forest openings and fields. Studies in New York, Delaware, Massachusetts and Virginia found that open, early-successional and grassy habitat is important at certain times of year. In Delaware, turtles were more numerous at less forested sites, but adults there also survived less well. They enter water at times, as studies in Tennessee, North Carolina and West Virginia have recorded.

A box turtle spends the night in a "form": a resting place made by settling into vegetation, leaf litter or soil until it is hidden and partly buried.

Radio-tracking shows that most turtles keep to a home range and return to much the same one each year. Average home ranges run from under 2 hectares in West Virginia and Tennessee to more than 7 hectares in Illinois, Indiana and Massachusetts, and individual ranges from 0.22 to 187.6 hectares have been measured. The home ranges of males and females do not differ significantly. Turtles in large tracts of forest travel further than those in more open or developed country.`,
    },

    // p.8-9 (item-level diet records at carolina sites; spore dispersal)
    diet: {
      sources: ['kiester2015'],
      body: `Like other box turtles, the Eastern Box Turtle is an omnivore. Records that are specific to this subspecies include mushrooms eaten on Long Island, New York, and carrion. In eastern Tennessee turtles were seen gathering around a local source of food.

One study looked at the dispersal of fungal spores by Eastern Box Turtles, and box turtles in general may be important in spreading seeds and fungi through their habitat.

The broader list of foods recorded for the species, which includes fruits, snails, slugs, insects and earthworms, is given on the Common Box Turtle page.`,
    },

    // p.8 (dormancy; Michigan emergence; overwintering sites at carolina sites; hatchlings overwintering, p.11)
    hibernation: {
      sources: ['kiester2015'],
      body: `Eastern Box Turtles spend the winter dormant. Northern populations are active from about April to October or November, and those further south, as in eastern Tennessee, have a longer active season.

Turtles choose wintering spots that are warmer than their surroundings and burrow down into leaf litter and soil, which stay much warmer than the air. Stump holes and the pits left by fallen trees are often used. The wintering site may lie outside a turtle's summer range.

A study of 44 adults in southwest Michigan followed their emergence in spring. The turtles came to the surface when their shells averaged 7.1 °C and left their wintering sites at an average of 14.3 °C.

Hatchlings do not always leave the nest in autumn; in New York some spent their first winter in the nest chamber.

In the active season the turtles are about by day, with a period of activity in the morning and, in hot weather, a midday rest followed by more activity in late afternoon.`,
    },

    // pp.10-11 (clutch size and frequency at carolina sites; nest sites; TSD in Indiana; Maryland females)
    nesting: {
      sources: ['kiester2015'],
      body: `Eastern Box Turtles nest in open places with sandy soil and little vegetation or leaf litter, often in openings made by people. Outside Florida, nesting is typical from late May to early July, and it usually takes place in the evening.

Clutches are larger here than in the Florida Box Turtle. Females studied in New York, Illinois and Massachusetts averaged more than five eggs. Two or three clutches a year have been reported, but near the northern limit of the range, in New York and Massachusetts, females have not been seen to lay more than one, and hormone measurements from a population in Indiana agree.

Hatchlings typically emerge from late August to early September, although some overwinter in the nest. In Eastern Box Turtles from Indiana, the sex of the hatchlings depended on incubation temperature: cooler eggs produced males and warmer eggs females, in a pattern that does not closely match that of any other turtle.

Females keep breeding into old age. In a long-studied population in Maryland they were still reproductively active when well past 50.`,
    },

    // pp.9-11 (homing, behavioural fever, speed, sibling distances, detection dogs, Stickel study); TTWG type and etymology
    unique_traits_and_qualities: {
      sources: ['kiester2015', 'ttwg2025'],
      body: `The Eastern Box Turtle is the form on which the species was founded. Linnaeus named it in 1758 from a specimen that had been illustrated in 1751, and its name refers to the Carolinas.

It is also one of the most thoroughly studied reptiles. Lucille Stickel began following the box turtles at Patuxent in Maryland in 1945, and the work continued for decades.

That research has turned up some surprises. Eastern Box Turtles are known to home, and a sick turtle will warm itself above its normal temperature, a behavioural fever. In one study their top walking speed was 0.49 metres per second, reached at 31.9 °C. And although most turtles seem to stay put, a genetic study in Indiana found that the few pairs of siblings it detected were living an average of 11.6 km apart, which suggests that box turtles disperse much further than had been assumed.

Juvenile box turtles are under-counted in surveys. Detection dogs have been observed to find a greater proportion of them.`,
    },

    // TTWG (no subspecies Red List line; CITES); pp.11-12, 15-16 (state and Canadian status, trends, densities, reserve size)
    conservation: {
      sources: ['ttwg2025', 'kiester2015', 'vanDijk2011'],
      body: `The Eastern Box Turtle has no Red List assessment of its own. The species it belongs to, the Common Box Turtle, is listed as Vulnerable (assessed in 2011), and like all box turtles it has been on Appendix II of CITES since 1995.

Canada designated the turtle Extirpated in 2014. In the United States, as of 2015, it was listed as a species of Special Concern in Connecticut, Indiana, Massachusetts, Michigan, New Hampshire, New Jersey, New York and Ohio, as Protected in Rhode Island and as Endangered in Maine.

The best evidence of decline comes from sites that have been watched for decades. At Patuxent in Maryland the population in 1995 was 23% of what it had been in 1955. At Allee Memorial Woods in Indiana, density fell from 4.4–5.7 turtles per hectare in the 1960s to 2.7 in 1983. Declines or extirpation have also been reported across large portions of Michigan and Massachusetts.

Densities vary widely, from fewer than one adult per hectare in fragmented populations and at the edge of the range to roughly 19–23 per hectare at a site in Tennessee. Reserves need to be large: a translocated population in Pennsylvania needed at least 800 hectares to contain its movements.`,
    },

    // pp.11, 15 (predators at carolina sites; survival; injuries)
    predators: {
      sources: ['kiester2015'],
      body: `Bald eagles in the Chesapeake Bay region have been recorded taking box turtles, hogs were reported as predators in Indiana more than a century ago, and chipmunks are suspected of preying on juveniles.

Adult Eastern Box Turtles survive well from year to year: about 81% annually in a Delaware study and 96% in one from the Midwest. Predation is thought to weigh more heavily on juveniles. In a Virginia population, 9.8% of the turtles carried injuries.`,
    },

    // pp.12-15 (threats documented at carolina sites)
    threats: {
      sources: ['kiester2015'],
      body: `The Eastern Box Turtle faces the same pressures as the species as a whole, and much of the evidence for them comes from this subspecies.

Roads are a particular danger. Box turtles close their shells when threatened and stay closed for longer than other turtles, a habit studied in West Virginia that may make them more likely to be killed on roads. Roads may also affect females searching for nest sites more than other turtles. At the long-studied sites in Maryland and Delaware the sex ratio became more male-biased as numbers fell.

Mowing and haying kill turtles in fields, as studies in North Carolina and Delaware have documented. Fire is another risk: the disappearance of box turtles from the Albany Pine Bush in New York has been attributed to fires, and turtles in recently burned areas may be in poorer condition. At the Delaware site a shortage of open nesting ground may also have played a part.

At Allee Memorial Woods in Indiana, incidental collection was suggested as one factor in the decline.

Disease is a growing concern. Chronic bacterial pneumonia and Mycoplasma have been found in wild Eastern Box Turtles, and ranavirus has been detected in wild populations, including at sub-lethal levels in Indiana.`,
    },
  },

  measurements: {
    adult_weight: null,
    length_female_max_scl: 19.8,
    length_male_max_scl: 17.4,
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

  // Species-level status; see notes.
  conservation: [
    { status: 'VU', year: 2011, date: null, sources: ['ttwg2025', 'vanDijk2011'] },
  ],
  population: [
    { year: 2015, estimate: null, trend: 'Decreasing', sources: ['kiester2015'] },
  ],

  habitats: ['Forests', 'Forest Openings & Edges', 'Fields & Grasslands'],
  ecologies: ['Terrestrial'],
  habitatTypes: ['Forests', 'Grasslands'],
  regions: ['Eastern United States', 'Southeastern United States'],
  threats: ['Deforestation', 'Urbanization', 'Infrastructure Development', 'Collection/Pet Trade', 'Agriculture', 'Controlled Burns'],
  behaviors: ['Diurnal'],
  newVocabulary: {
    habitats: ['Forests', 'Forest Openings & Edges', 'Fields & Grasslands'],
    habitatTypes: ['Forests'],
  },
  tagSources: ['kiester2015', 'ttwg2025'],

  // Only what the sources state for this subspecies or for the group it
  // belongs to. Most fields are empty: see notes.
  physicalFeatures: [
    {
      life_stage: 'adult', sex: null, sources: ['kiester2015', 'ttwg2025'],
      values: {
        carapace_shape: 'keeled; deepest behind the plastral hinge',
        carapace_pattern: 'variable; light lines, spots or blotches',
        carapace_colors: 'dark brown to black with yellow, orange or white markings',
        marginal_scute_shape: 'first marginal scute rectangular',
        vertebral_keel: 'present',
        hinge_present: 'true',
        hinge_location: 'plastron',
      },
    },
    {
      life_stage: 'adult', sex: 'male', sources: ['kiester2015', 'ttwg2025'],
      values: {
        eye_color: 'iris often bright red',
        tail_length: 'larger than the female\'s, with the vent further back',
        carapace_shape: 'keeled; deepest behind the plastral hinge',
        carapace_pattern: 'variable; light lines, spots or blotches',
        carapace_colors: 'dark brown to black with yellow, orange or white markings',
        marginal_scute_shape: 'first marginal scute rectangular',
        vertebral_keel: 'present',
        hinge_present: 'true',
        hinge_location: 'plastron',
      },
    },
    {
      life_stage: 'adult', sex: 'female', sources: ['kiester2015', 'ttwg2025'],
      values: {
        eye_color: 'iris usually brown, occasionally red',
        tail_length: 'smaller than the male\'s',
        carapace_shape: 'keeled; deepest behind the plastral hinge',
        carapace_pattern: 'variable; light lines, spots or blotches',
        carapace_colors: 'dark brown to black with yellow, orange or white markings',
        marginal_scute_shape: 'first marginal scute rectangular',
        vertebral_keel: 'present',
        hinge_present: 'true',
        hinge_location: 'plastron',
      },
    },
    {
      life_stage: 'hatchling', sex: null, sources: ['kiester2015'],
      values: {
        carapace_pattern: 'often a single yellow dot in the centre of each scute',
        carapace_colors: 'dark with yellow dots',
      },
    },
  ],

  notes: [
    'The conservation status entered is the SPECIES-level Red List category (Vulnerable, 2011). The checklist gives no category for the subspecies. The page badge will read Vulnerable; the text says it applies to the species. Say if you would rather leave the status empty on subspecies pages.',
    'Physical features are very sparse. The account has almost no description specific to this subspecies: the shell characters are the ones it gives for the group the subspecies belongs to, and the pattern and colours rest partly on the checklist\'s notes on old synonym names. The number of hind toes, the head, neck, limb and plastron colours and the hinge position are not in either source.',
    'Weight and lifespan are left empty (no body mass given; lifespan only as estimates). "Generally larger" is left empty: the record lengths favour the female, but neither source says which sex is typically larger.',
    'The 19.8 cm record: the checklist lists it as the female maximum; the account reports a 198 mm animal from New York without giving its sex.',
    'Incubation length is not given here because the reported range (57–136 days) pools a north Florida study with one whose site is not stated; it is on the Common Box Turtle page.',
    'The Delaware decline figures (91 to 22 between 1968 and 2002) were left out because the account does not say what was counted.',
    'The diet section is short on purpose: the account\'s food list is for the species as a whole, and only a few items are tied to this subspecies.',
    'State listings are as of the 2015 account and may have changed.',
    'This profile is already published, so running this file makes the text live straight away.',
  ],
};

export default species;

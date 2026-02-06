// ============================================================================
// MOCK DATA — Replace with real Supabase queries in Phase 2-3
// ============================================================================

export interface MockNews {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  news_type: 'announcement' | 'featured' | 'partner_news' | 'conservation';
  partner_name: string | null;
  image_url: string | null;
  published_at: string;
}

export interface MockFeaturedSpecies {
  species_id: number;
  species_common_name: string;
  species_slug: string;
  description: string;
  image_url: string;
  feature_start_date: string;
  source_name: string;
}

export interface MockChannel {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'general' | 'care' | 'conservation';
  member_count: number;
  post_count: number;
}

export interface MockPost {
  id: number;
  title: string;
  body: string;
  score: number;
  comment_count: number;
  created_at: string;
  image_url?: string;
  author: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  channel: {
    slug: string;
    name: string;
  };
}

export interface MockContributor {
  username: string;
  display_name: string;
  badge: string;
  points: number;
}

export interface MockTrendingTopic {
  name: string;
  post_count: number;
}

export const MOCK_FEATURED_SPECIES: MockFeaturedSpecies = {
  species_id: 1,
  species_common_name: 'Red-Eared Slider',
  species_slug: 'red-eared-slider',
  description:
    'Connect with fellow turtle enthusiasts, share your experiences, and learn from the community. Join discussions, ask questions, and help others on their turtle journey.',
  image_url: '/images/community/featured-species-placeholder.jpg',
  feature_start_date: '2026-01-20',
  source_name: 'Turterra',
};

export const MOCK_NEWS: MockNews[] = [
  {
    id: 1,
    slug: 'sea-turtle-nesting-report',
    title: 'Sea Turtle Nesting Season Report',
    excerpt:
      'Connect with fellow turtle enthusiasts, share your experiences, and learn from the community. Join discussions, ask questions, and help others on their turtle journey.',
    news_type: 'conservation',
    partner_name: 'Re:Wild',
    image_url: '/images/community/news-placeholder-1.jpg',
    published_at: '2026-01-13T12:00:00Z',
  },
  {
    id: 2,
    slug: 'turterra-updates-jan-2026',
    title: 'Turterra Updates | Jan 2026',
    excerpt:
      'Connect with fellow turtle enthusiasts, share your experiences, and learn from the community. Join discussions, ask questions, and help others on their turtle journey.',
    news_type: 'announcement',
    partner_name: 'Turterra',
    image_url: '/images/community/news-placeholder-2.jpg',
    published_at: '2026-01-08T12:00:00Z',
  },
  {
    id: 3,
    slug: 'tsa-breeding-program',
    title: 'Turtle Survival Alliance Updates',
    excerpt:
      'Connect with fellow turtle enthusiasts, share your experiences, and learn from the community. Join discussions, ask questions, and help others on their turtle journey.',
    news_type: 'partner_news',
    partner_name: 'Turtle Survival Alliance',
    image_url: '/images/community/news-placeholder-3.jpg',
    published_at: '2026-01-05T12:00:00Z',
  },
  {
    id: 4,
    slug: 'rescue-success-story',
    title: 'Community Spotlight: Rescue Success Story',
    excerpt:
      'Member @turtlelover_sarah shares her incredible journey rehabilitating an injured box turtle.',
    news_type: 'featured',
    partner_name: null,
    image_url: '/images/community/news-placeholder-4.jpg',
    published_at: '2026-01-03T12:00:00Z',
  },
];

export const MOCK_CHANNELS: MockChannel[] = [
  {
    id: 1,
    slug: 'announcements',
    name: 'Announcements',
    description: 'Official updates from Turterra about new features, events, and important news.',
    icon: 'megaphone',
    category: 'general',
    member_count: 12453,
    post_count: 89,
  },
  {
    id: 2,
    slug: 'roadmap',
    name: 'Roadmap & Feedback',
    description: "Share your ideas for Turterra and see what features we're working on next.",
    icon: 'map',
    category: 'general',
    member_count: 4521,
    post_count: 234,
  },
  {
    id: 3,
    slug: 'introductions',
    name: 'Introductions',
    description: 'New to Turterra? Introduce yourself and your shelled companions!',
    icon: 'users',
    category: 'general',
    member_count: 8932,
    post_count: 1245,
  },
  {
    id: 4,
    slug: 'help',
    name: 'Q&A Help Desk',
    description: 'Got questions? Ask anything turtle-related and get help from the community.',
    icon: 'help-circle',
    category: 'general',
    member_count: 10234,
    post_count: 3421,
  },
  {
    id: 5,
    slug: 'care',
    name: 'Care & Husbandry',
    description: 'Diet, feeding schedules, water quality, and general care discussions.',
    icon: 'heart',
    category: 'care',
    member_count: 9876,
    post_count: 2345,
  },
  {
    id: 6,
    slug: 'habitat',
    name: 'Habitat & Setup',
    description: 'Enclosure builds, tank setups, outdoor habitats, and equipment reviews.',
    icon: 'home',
    category: 'care',
    member_count: 7654,
    post_count: 1876,
  },
  {
    id: 7,
    slug: 'health',
    name: 'Health & Wellness',
    description: 'Health concerns, vet recommendations, shell care, and wellness tips.',
    icon: 'activity',
    category: 'care',
    member_count: 6543,
    post_count: 1234,
  },
  {
    id: 8,
    slug: 'conservation',
    name: 'Conservation',
    description: 'Conservation efforts, endangered species updates, and how to help.',
    icon: 'leaf',
    category: 'conservation',
    member_count: 5432,
    post_count: 987,
  },
  {
    id: 9,
    slug: 'species-id',
    name: 'Species Identification',
    description: 'Help identifying turtle species from photos and field observations.',
    icon: 'search',
    category: 'conservation',
    member_count: 8765,
    post_count: 2345,
  },
  {
    id: 10,
    slug: 'wild-observations',
    name: 'Wild Observations',
    description: 'Share your wild turtle sightings, nesting observations, and field notes.',
    icon: 'eye',
    category: 'conservation',
    member_count: 4321,
    post_count: 876,
  },
];

export const MOCK_POSTS: MockPost[] = [
  {
    id: 1,
    title: "Finally identified my mystery turtle – it's a Diamondback Terrapin!",
    body: "After months of wondering what species I rescued from the roadside, I finally got confirmation using the Species ID tool. She's a beautiful Northern Diamondback Terrapin! Anyone have experience with their care requirements? I want to make sure I'm doing everything right.",
    score: 142,
    comment_count: 34,
    created_at: '2026-02-05T06:00:00Z',
    author: {
      username: 'terrapin_marcus',
      display_name: 'Marcus',
      avatar_url: null,
    },
    channel: {
      slug: 'species-id',
      name: 'Species Identification',
    },
  },
  {
    id: 2,
    title: 'My outdoor pond build – 6 months in!',
    body: "I finally finished the outdoor pond setup for my three Red-eared Sliders. Here's a breakdown of what I used and what I'd do differently...",
    score: 98,
    comment_count: 22,
    created_at: '2026-02-05T04:30:00Z',
    author: {
      username: 'pond_life_jenny',
      display_name: 'Jenny',
      avatar_url: null,
    },
    channel: {
      slug: 'habitat',
      name: 'Habitat & Setup',
    },
  },
  {
    id: 3,
    title: 'Worried about soft shell on my painted turtle',
    body: "I've noticed my painted turtle's shell seems softer than usual. She's about 4 years old and has a UVB lamp. Could it be a calcium issue? Any advice appreciated.",
    score: 45,
    comment_count: 18,
    created_at: '2026-02-04T18:15:00Z',
    author: {
      username: 'shell_worried',
      display_name: 'Alex',
      avatar_url: null,
    },
    channel: {
      slug: 'health',
      name: 'Health & Wellness',
    },
  },
  {
    id: 4,
    title: 'Best basking platforms for small turtles?',
    body: "I have a young musk turtle and I'm struggling to find a good basking platform. The commercial ones seem too big. What do you all use?",
    score: 31,
    comment_count: 12,
    created_at: '2026-02-04T14:00:00Z',
    author: {
      username: 'tiny_turtle_fan',
      display_name: null,
      avatar_url: null,
    },
    channel: {
      slug: 'care',
      name: 'Care & Husbandry',
    },
  },
  {
    id: 5,
    title: "Spotted a wild Blanding's turtle in Minnesota!",
    body: "Was hiking near a wetland preserve today and spotted what I believe is a Blanding's turtle! That distinctive yellow chin was unmistakable. These are listed as threatened in MN so it was a really special sighting.",
    score: 203,
    comment_count: 41,
    created_at: '2026-02-04T10:00:00Z',
    author: {
      username: 'midwest_herper',
      display_name: 'Sam',
      avatar_url: null,
    },
    channel: {
      slug: 'wild-observations',
      name: 'Wild Observations',
    },
  },
];

export const MOCK_COMMUNITY_STATS = {
  total_members: 15234,
  online_today: 342,
  total_posts: 45678,
  total_channels: 10,
};

export const MOCK_TRENDING: MockTrendingTopic[] = [
  { name: 'BoxTurtleCare', post_count: 234 },
  { name: 'NestingSeason2026', post_count: 189 },
  { name: 'ShellHealth', post_count: 156 },
  { name: 'TurtleRescue', post_count: 142 },
  { name: 'UVBLighting', post_count: 98 },
];

export const MOCK_TOP_CONTRIBUTORS: MockContributor[] = [
  {
    username: 'dr_emily_r',
    display_name: 'Dr. Emily Rodriguez',
    badge: 'Verified Expert',
    points: 12450,
  },
  {
    username: 'shell_guardian',
    display_name: 'Shell Guardian',
    badge: 'Top Helper',
    points: 8920,
  },
  {
    username: 'turtle_rehab_mike',
    display_name: 'Mike T.',
    badge: 'Rescue Hero',
    points: 7340,
  },
];

// Category display configuration
export const CATEGORY_CONFIG: Record<
  string,
  { label: string; description: string }
> = {
  general: {
    label: 'General',
    description: 'Official announcements, updates, and community-wide discussions',
  },
  care: {
    label: 'Care & Husbandry',
    description: 'Everything about keeping turtles healthy and happy',
  },
  conservation: {
    label: 'Conservation & Science',
    description: 'Wildlife conservation, research, and species identification',
  },
};

export const CATEGORY_ORDER = ['general', 'care', 'conservation'] as const;

// News type badge styles
export const NEWS_TYPE_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  announcement: {
    bg: 'bg-red-500',
    text: 'text-white',
    label: 'Announcement',
  },
  featured: {
    bg: 'bg-blue-500',
    text: 'text-white',
    label: 'Featured',
  },
  featured_species: {
    bg: 'bg-green-600',
    text: 'text-white',
    label: 'Featured Species',
  },
  partner_news: {
    bg: 'bg-orange-500',
    text: 'text-white',
    label: 'Partner News',
  },
  conservation: {
    bg: 'bg-green-600',
    text: 'text-white',
    label: 'Conservation',
  },
};

// Channel icon colors for visual variety
export const CHANNEL_ICON_COLORS: Record<string, { bg: string; icon: string }> = {
  announcements: { bg: 'bg-teal-600', icon: 'text-white' },
  roadmap: { bg: 'bg-amber-500', icon: 'text-white' },
  introductions: { bg: 'bg-blue-500', icon: 'text-white' },
  help: { bg: 'bg-emerald-600', icon: 'text-white' },
  care: { bg: 'bg-rose-500', icon: 'text-white' },
  habitat: { bg: 'bg-orange-500', icon: 'text-white' },
  health: { bg: 'bg-red-500', icon: 'text-white' },
  conservation: { bg: 'bg-green-600', icon: 'text-white' },
  'species-id': { bg: 'bg-violet-500', icon: 'text-white' },
  'wild-observations': { bg: 'bg-sky-500', icon: 'text-white' },
};

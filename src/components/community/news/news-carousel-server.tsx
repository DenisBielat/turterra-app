import { getLatestNews, getActiveFeaturedSpecies } from '@/lib/queries/community';
import { NewsCarousel } from './news-carousel';
import { MOCK_NEWS, MOCK_FEATURED_SPECIES } from '@/lib/community/mock-data';

/**
 * News Carousel Server Component
 *
 * Fetches news and featured species data, then passes to the client carousel.
 * Falls back to mock data if no real data exists yet.
 */
export async function NewsCarouselServer() {
  let news;
  let featuredSpecies;

  try {
    const [newsData, speciesData] = await Promise.all([
      getLatestNews(),
      getActiveFeaturedSpecies(),
    ]);
    news = newsData && newsData.length > 0 ? newsData : null;
    featuredSpecies = speciesData;
  } catch {
    // Fall back to mock data if queries fail (e.g., tables not seeded yet)
    news = null;
    featuredSpecies = null;
  }

  // Transform DB news to the shape the carousel expects
  const newsItems = news
    ? news.map((n) => ({
        id: n.id,
        slug: n.slug,
        title: n.title,
        excerpt: n.excerpt,
        news_type: n.news_type as 'announcement' | 'featured' | 'partner_news' | 'conservation',
        partner_name: n.partner_name,
        image_url: n.image_url,
        published_at: n.published_at,
      }))
    : MOCK_NEWS;

  // Transform DB featured species or fall back to mock
  const featured = featuredSpecies
    ? {
        species_id: featuredSpecies.species_id,
        species_common_name: '', // Will be resolved when wired to turtle_species
        species_slug: '',
        description: featuredSpecies.description ?? '',
        image_url: '',
        feature_start_date: featuredSpecies.feature_start_date,
        source_name: 'Turterra',
      }
    : MOCK_FEATURED_SPECIES;

  return <NewsCarousel news={newsItems} featuredSpecies={featured} />;
}

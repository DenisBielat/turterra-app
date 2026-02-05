import Link from 'next/link';
import { MockNews, NEWS_TYPE_STYLES } from '@/lib/community/mock-data';
import { formatDate } from '@/lib/community/utils';

interface NewsCardProps {
  news: MockNews;
}

/**
 * News Card Component
 *
 * Displays a single news item in the carousel.
 */
export function NewsCard({ news }: NewsCardProps) {
  const typeStyle = NEWS_TYPE_STYLES[news.news_type];

  return (
    <Link
      href={`/community/news/${news.slug}`}
      className="flex-shrink-0 w-72 bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
    >
      {/* Type Badge */}
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyle.bg} ${typeStyle.text}`}
      >
        {typeStyle.label}
      </span>

      {/* Title */}
      <h3 className="mt-3 font-semibold text-green-950 line-clamp-2 leading-snug">
        {news.title}
      </h3>

      {/* Excerpt */}
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
        {news.excerpt}
      </p>

      {/* Footer: Date and optional partner */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(news.published_at)}</span>
        {news.partner_name && (
          <span className="text-gray-400">{news.partner_name}</span>
        )}
      </div>
    </Link>
  );
}

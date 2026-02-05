import Link from 'next/link';
import Image from 'next/image';
import { MockNews, NEWS_TYPE_STYLES } from '@/lib/community/mock-data';
import { formatDate } from '@/lib/community/utils';

interface NewsCardProps {
  news: MockNews;
}

/**
 * News Card Component
 *
 * Displays a single news item with image, badge, title, excerpt, and footer.
 */
export function NewsCard({ news }: NewsCardProps) {
  const typeStyle = NEWS_TYPE_STYLES[news.news_type];

  return (
    <Link
      href={`/community/news/${news.slug}`}
      className="flex-shrink-0 w-60 bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      {/* Image */}
      {news.image_url ? (
        <div className="relative w-full h-36 bg-green-100">
          <Image
            src={news.image_url}
            alt={news.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-36 bg-green-100" />
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Type Badge */}
        <span
          className={`inline-flex items-center self-start px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyle.bg} ${typeStyle.text}`}
        >
          {typeStyle.label}
        </span>

        {/* Title */}
        <h3 className="mt-2.5 font-semibold text-green-950 line-clamp-2 leading-snug text-sm">
          {news.title}
        </h3>

        {/* Excerpt */}
        <p className="mt-1.5 text-xs text-gray-600 line-clamp-3 leading-relaxed flex-1">
          {news.excerpt}
        </p>

        {/* Footer: Source | Date */}
        <div className="mt-3 text-xs text-gray-500">
          {news.partner_name && (
            <span>{news.partner_name} | </span>
          )}
          <span>{formatDate(news.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}

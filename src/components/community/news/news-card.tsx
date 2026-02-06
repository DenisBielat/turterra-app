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
      className="group flex-shrink-0 w-72 h-[384px] flex flex-col bg-white rounded-xl border-2 border-green-950 overflow-hidden shadow-sm"
    >
      {/* Image: inset with rounded corners so it doesn't touch the card edges */}
      <div className="p-3 pb-0 flex-shrink-0">
        {news.image_url ? (
          <div className="relative w-full h-[180px] overflow-hidden bg-green-100 rounded-lg border border-gray-200">
            <Image
              src={news.image_url}
              alt={news.title}
              fill
              className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
              sizes="264px"
            />
          </div>
        ) : (
          <div className="w-full h-[180px] bg-green-100 rounded-lg" />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Type Badge */}
        <span
          className={`inline-flex items-center self-start px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyle.bg} ${typeStyle.text}`}
        >
          {typeStyle.label}
        </span>

        {/* Title */}
        <h3 className="mt-2.5 font-semibold text-green-950 line-clamp-2 leading-snug text-base">
          {news.title}
        </h3>

        {/* Excerpt */}
        <p className="mt-1.5 text-sm text-gray-600 line-clamp-3 flex-1">
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

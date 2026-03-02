import { Icon } from '@/components/Icon';
import type { IconNameMap } from '@/types/icons';

interface StatCard {
  icon: IconNameMap['line'];
  label: string;
  value: string;
  description?: string | null;
}

interface CareGuideAtAGlanceProps {
  introText: string | null;
  stats: StatCard[];
  commitWarning: string | null;
}

export function CareGuideAtAGlance({ introText, stats, commitWarning }: CareGuideAtAGlanceProps) {
  return (
    <section id="at-a-glance" className="scroll-mt-40">
      {/* Heading */}
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-950 mb-4">
        At a Glance
      </h2>

      {/* Intro paragraph */}
      {introText && (
        <p className="text-gray-700 text-base leading-relaxed mb-8 max-w-3xl">
          {introText}
        </p>
      )}

      {/* Stat cards grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-colors hover:bg-green-900/20"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-900/20 flex-shrink-0">
                  <Icon name={stat.icon} style="line" size="base" className="text-green-700" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {stat.label}
                </p>
              </div>
              <p className="text-base font-bold text-green-950 capitalize">
                {stat.value}
              </p>
              {stat.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Before You Commit callout */}
      {commitWarning && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-5 md:p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-200">
                <Icon name="turtle" style="line" size="base" className="text-red-700" />
              </div>
            </div>
            <div>
              <h3 className="font-heading font-bold text-red-950 text-sm md:text-base mb-1">
                Before You Commit
              </h3>
              <p className="text-red-800/80 text-sm leading-relaxed">
                {commitWarning}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

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
      {/* Heading with green left accent */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-green-600 rounded-full" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-950">
          At a Glance
        </h2>
      </div>

      {/* Intro paragraph */}
      {introText && (
        <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8 max-w-3xl">
          {introText}
        </p>
      )}

      {/* Stat cards grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-2.5 p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100">
                <Icon name={stat.icon} style="line" size="base" className="text-green-700" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                  {stat.label}
                </p>
                <p className="text-base font-bold text-green-950">
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {stat.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Before You Commit callout */}
      {commitWarning && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-5 md:p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-200">
                <Icon name="turtle" style="line" size="base" className="text-green-800" />
              </div>
            </div>
            <div>
              <h3 className="font-heading font-bold text-green-950 text-sm md:text-base mb-1">
                Before You Commit
              </h3>
              <p className="text-green-800/80 text-sm leading-relaxed">
                {commitWarning}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

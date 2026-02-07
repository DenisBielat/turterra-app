import { ShieldCheck } from 'lucide-react';

const COMMUNITY_RULES = [
  {
    number: 1,
    title: 'Be respectful and kind',
    description: 'Treat all community members with courtesy. No harassment, hate speech, or personal attacks.',
  },
  {
    number: 2,
    title: 'Stay on topic',
    description: 'Post in the appropriate channel. Keep discussions relevant to turtles and tortoises.',
  },
  {
    number: 3,
    title: 'No misinformation',
    description: 'Share accurate care information. Cite sources when possible and correct mistakes promptly.',
  },
  {
    number: 4,
    title: 'No spam or self-promotion',
    description: 'Avoid excessive links, ads, or repeated posts. Sharing helpful resources is welcome.',
  },
  {
    number: 5,
    title: 'Protect animal welfare',
    description: 'Never promote illegal collection, trade, or harmful practices toward any species.',
  },
];

interface CommunityRulesProps {
  variant?: 'sidebar' | 'inline';
}

/**
 * Community Rules Component
 *
 * Displays the community posting guidelines. Used in the sidebar
 * and on the create post page to remind users of expectations.
 */
export function CommunityRules({ variant = 'sidebar' }: CommunityRulesProps) {
  if (variant === 'inline') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-green-700" />
          <h3 className="font-semibold text-green-950">Posting Guidelines</h3>
        </div>
        <ul className="space-y-2">
          {COMMUNITY_RULES.map((rule) => (
            <li key={rule.number} className="flex gap-2 text-sm">
              <span className="text-green-700 font-semibold flex-shrink-0">
                {rule.number}.
              </span>
              <span className="text-gray-700">
                <span className="font-medium text-green-950">{rule.title}</span>
                {' \u2014 '}
                {rule.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-5 w-5 text-green-700" />
        <h3 className="font-semibold text-green-950">Community Rules</h3>
      </div>
      <ol className="space-y-3">
        {COMMUNITY_RULES.map((rule) => (
          <li key={rule.number} className="flex gap-3 text-sm">
            <span className="text-green-700 font-bold flex-shrink-0 w-5 text-right">
              {rule.number}
            </span>
            <div>
              <p className="font-medium text-green-950">{rule.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{rule.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

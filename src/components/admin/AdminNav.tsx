import Link from "next/link";

const ADMIN_PAGES = [
  { href: "/admin/species", label: "Species tracker" },
  { href: "/admin/follow-ups", label: "Follow-ups" },
] as const;

/** Links between the admin pages, shown at the top of each one. */
export default function AdminNav({ current }: { current: (typeof ADMIN_PAGES)[number]["href"] }) {
  return (
    <nav aria-label="Admin pages" className="mb-5 flex flex-wrap gap-x-5 gap-y-1 border-b border-gray-200 text-sm">
      {ADMIN_PAGES.map((page) => {
        const active = page.href === current;
        return (
          <Link
            key={page.href}
            href={page.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 pb-2 ${
              active
                ? "border-green-800 font-semibold text-green-950"
                : "border-transparent text-gray-600 hover:border-gray-300 hover:text-green-950"
            }`}
          >
            {page.label}
          </Link>
        );
      })}
    </nav>
  );
}

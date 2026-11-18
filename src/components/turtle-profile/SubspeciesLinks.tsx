import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { LinkedTaxon } from "@/types/turtleTypes";

const PLACEHOLDER_IMAGE = "/images/image-placeholder.png";

/**
 * Shown at the top of a subspecies profile: which species it belongs to,
 * linking to that species' profile when it has one.
 */
export function ParentSpeciesLink({
  parentSpecies,
  parentScientificName,
}: {
  parentSpecies: LinkedTaxon | null;
  parentScientificName: string;
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700 mb-6">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-900/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-green-900">
        <Icon name="hierarchy" style="line" size="sm" />
        Subspecies
      </span>
      {parentSpecies ? (
        <span>
          of the{" "}
          <Link
            href={`/turtle-guide/${parentSpecies.slug}`}
            className="font-semibold text-green-800 underline underline-offset-2 hover:text-green-950"
          >
            {parentSpecies.commonName}
          </Link>{" "}
          (<em>{parentSpecies.scientificName}</em>)
        </span>
      ) : (
        <span>
          of <em>{parentScientificName}</em>
        </span>
      )}
    </p>
  );
}

/**
 * Shown on a species profile that has subspecies profiles: one card per
 * subspecies, each linking to its own page.
 */
export function SubspeciesList({
  speciesCommonName,
  subspecies,
}: {
  speciesCommonName: string;
  subspecies: LinkedTaxon[];
}) {
  if (subspecies.length === 0) return null;

  return (
    <section aria-labelledby="subspecies-heading" className="mt-10">
      <h3 id="subspecies-heading" className="font-heading font-bold text-xl text-green-950">
        Subspecies
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        {subspecies.length === 1
          ? `One subspecies of the ${speciesCommonName} has its own profile.`
          : `${subspecies.length} subspecies of the ${speciesCommonName} have their own profiles.`}
      </p>
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {subspecies.map((taxon) => (
          <li key={taxon.slug}>
            <Link
              href={`/turtle-guide/${taxon.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-green-700"
            >
              <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                <Image
                  src={taxon.avatarUrl || PLACEHOLDER_IMAGE}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized={!taxon.avatarUrl}
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-heading font-bold text-green-950 group-hover:text-green-800">
                  {taxon.commonName}
                </span>
                <span className="block truncate text-sm italic text-gray-600">{taxon.scientificName}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

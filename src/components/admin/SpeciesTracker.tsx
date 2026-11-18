"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import {
  type SectionState,
  type SpeciesProgressRow,
  type TrackingStatus,
  TRACKING_STATUS_LABEL,
  TRACKING_STATUS_ORDER,
  countCompleteSections,
  getSectionProgress,
} from "@/lib/admin/species-progress";

type StatusFilter = TrackingStatus | "all";
type RankFilter = "all" | "species" | "subspecies";

const STATUS_BADGE: Record<TrackingStatus, string> = {
  published: "bg-green-100 text-green-900 border-green-300",
  draft: "bg-blue-50 text-blue-800 border-blue-200",
  skipped: "bg-gray-100 text-gray-600 border-gray-300",
  not_started: "bg-white text-gray-500 border-gray-300",
};

const SECTION_CHIP: Record<SectionState, string> = {
  complete: "bg-green-100 text-green-900 border-green-300",
  partial: "bg-orange-50 text-orange-800 border-orange-300",
  missing: "bg-white text-gray-400 border-gray-300 border-dashed",
};

const SECTION_STATE_LABEL: Record<SectionState, string> = {
  complete: "entered",
  partial: "partly entered",
  missing: "missing",
};

interface TrackerRow {
  row: SpeciesProgressRow;
  key: string;
  sections: ReturnType<typeof getSectionProgress> | null;
  completeCount: number;
  displayCommonName: string | null;
  searchText: string;
}

function toTrackerRow(row: SpeciesProgressRow): TrackerRow {
  const hasProfile = row.species_id !== null;
  const sections = hasProfile ? getSectionProgress(row) : null;
  const displayCommonName = row.species_common_name || row.checklist_common_name;

  return {
    row,
    key: row.checklist_id !== null ? `c${row.checklist_id}` : `s${row.species_id}`,
    sections,
    completeCount: sections ? countCompleteSections(sections) : 0,
    displayCommonName,
    searchText: [
      row.scientific_name,
      row.profile_scientific_name,
      row.species_common_name,
      row.checklist_common_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

function compareRows(a: TrackerRow, b: TrackerRow): number {
  const statusDiff =
    TRACKING_STATUS_ORDER.indexOf(a.row.tracking_status) -
    TRACKING_STATUS_ORDER.indexOf(b.row.tracking_status);
  if (statusDiff !== 0) return statusDiff;

  // Among profiles, the ones with the most left to do come first.
  if (a.sections && b.sections && a.completeCount !== b.completeCount) {
    return a.completeCount - b.completeCount;
  }
  if (!a.sections && !b.sections) {
    const familyDiff = (a.row.family || "~").localeCompare(b.row.family || "~");
    if (familyDiff !== 0) return familyDiff;
  }
  return (a.row.scientific_name || "").localeCompare(b.row.scientific_name || "");
}

export default function SpeciesTracker({ rows }: { rows: SpeciesProgressRow[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState<RankFilter>("all");
  const [query, setQuery] = useState("");

  const trackerRows = useMemo(() => rows.map(toTrackerRow).sort(compareRows), [rows]);

  const families = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.family).filter((f): f is string => !!f))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [rows]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<TrackingStatus, number> = {
      published: 0,
      draft: 0,
      skipped: 0,
      not_started: 0,
    };
    for (const r of rows) counts[r.tracking_status] += 1;
    return counts;
  }, [rows]);

  const speciesRows = rows.filter((r) => r.taxon_rank === "species");
  const subspeciesRows = rows.filter((r) => r.taxon_rank === "subspecies");
  const publishedSpecies = speciesRows.filter((r) => r.tracking_status === "published").length;
  const publishedPercent =
    speciesRows.length > 0 ? Math.round((publishedSpecies / speciesRows.length) * 100) : 0;

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return trackerRows.filter(({ row, searchText }) => {
      if (statusFilter !== "all" && row.tracking_status !== statusFilter) return false;
      if (familyFilter !== "all" && row.family !== familyFilter) return false;
      if (rankFilter !== "all" && row.taxon_rank !== rankFilter) return false;
      if (needle && !searchText.includes(needle)) return false;
      return true;
    });
  }, [trackerRows, statusFilter, familyFilter, rankFilter, query]);

  const filtersActive =
    statusFilter !== "all" || familyFilter !== "all" || rankFilter !== "all" || query.trim() !== "";

  const statusTabs: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: rows.length },
    ...TRACKING_STATUS_ORDER.map((status) => ({
      value: status as StatusFilter,
      label: TRACKING_STATUS_LABEL[status],
      count: statusCounts[status],
    })),
  ];

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-[90rem] mx-auto px-4 lg:px-10 py-8">
        {/* Header */}
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-green-950 font-heading mb-4">Species tracker</h1>
          <AdminNav current="/admin/species" />
          <p className="text-sm text-gray-600 max-w-3xl">
            Every taxon on the reference checklist, whether it has a Turterra profile, and which
            sections of that profile have been entered. Counts come straight from the species
            tables, so this is always current.
          </p>
        </header>

        {/* Summary */}
        <section aria-label="Summary" className="mb-6 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Species published</p>
            <p className="mt-1 text-2xl font-bold text-green-950">
              {publishedSpecies}
              <span className="text-base font-normal text-gray-500"> of {speciesRows.length}</span>
            </p>
            <div
              className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={speciesRows.length}
              aria-valuenow={publishedSpecies}
              aria-label="Species published"
            >
              <div className="h-full rounded-full bg-green-600" style={{ width: `${publishedPercent}%` }} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {publishedPercent}% of species. The checklist also lists {subspeciesRows.length} subspecies.
            </p>
          </div>
          <SummaryTile label="Drafts" value={statusCounts.draft} hint="Profiles only admins can see" />
          <SummaryTile label="Not started" value={statusCounts.not_started} hint="No profile yet" />
          <SummaryTile label="Skipped" value={statusCounts.skipped} hint="Set aside, with a reason" />
        </section>

        {/* Filters */}
        <section aria-label="Filters" className="mb-4 space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-green-950 bg-green-950 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-green-900"
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 text-xs ${active ? "text-green-200" : "text-gray-500"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col text-xs text-gray-600 grow min-w-[14rem] max-w-md">
              Search the checklist
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Scientific or common name"
                className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </label>
            <label className="flex flex-col text-xs text-gray-600">
              Family
              <select
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="all">All families</option>
                {families.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-xs text-gray-600">
              Rank
              <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value as RankFilter)}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="all">Species and subspecies</option>
                <option value="species">Species only</option>
                <option value="subspecies">Subspecies only</option>
              </select>
            </label>
            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setFamilyFilter("all");
                  setRankFilter("all");
                  setQuery("");
                }}
                className="rounded-lg px-3 py-2 text-sm text-green-800 underline underline-offset-2 hover:text-green-950"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <span aria-live="polite">
              Showing {visibleRows.length} of {rows.length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`inline-block rounded border px-1.5 py-0.5 ${SECTION_CHIP.complete}`}>Entered</span>
              <span className={`inline-block rounded border px-1.5 py-0.5 ${SECTION_CHIP.partial}`}>Partly</span>
              <span className={`inline-block rounded border px-1.5 py-0.5 ${SECTION_CHIP.missing}`}>Missing</span>
            </span>
          </div>
        </section>

        {/* Table */}
        {/* "relative" keeps the visually-hidden labels inside the scroll area, so the page itself never scrolls sideways */}
        <div className="relative rounded-xl border border-gray-200 bg-white overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Taxon</th>
                <th scope="col" className="px-4 py-3 font-semibold">Family</th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  <abbr title="Conservation status on the checklist: IUCN Red List category, or the TFTSG provisional category where IUCN has none" className="no-underline">
                    Red List
                  </abbr>
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">Profile</th>
                <th scope="col" className="px-4 py-3 font-semibold">Sections entered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visibleRows.map((item) => (
                <TrackerTableRow key={item.key} item={item} />
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    Nothing matches these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-gray-500 max-w-3xl">
          Taxa follow Turtles of the World, 10th Ed. (Turtle Taxonomy Working Group 2025).
          Conservation status comes from the Turtle Conservancy&apos;s Turtles of the World list
          where it covers the taxon. Families shown here follow Turterra&apos;s own taxonomy tables
          where the genus is known.
        </p>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-green-950">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{hint}</p>
    </div>
  );
}

function TrackerTableRow({ item }: { item: TrackerRow }) {
  const { row, sections, completeCount, displayCommonName } = item;
  const profileNameDiffers =
    row.species_id !== null &&
    row.checklist_id !== null &&
    row.profile_scientific_name !== null &&
    row.profile_scientific_name !== row.scientific_name;

  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <div className="font-medium text-green-950">
          {row.slug ? (
            <Link
              href={`/turtle-guide/${row.slug}`}
              className="underline decoration-gray-300 underline-offset-2 hover:decoration-green-700"
            >
              <em>{row.scientific_name}</em>
            </Link>
          ) : (
            <em>{row.scientific_name}</em>
          )}
          {row.taxon_rank === "subspecies" && (
            <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-normal not-italic text-gray-600">
              subspecies
            </span>
          )}
        </div>
        {displayCommonName && <div className="text-gray-600">{displayCommonName}</div>}
        {profileNameDiffers && (
          <div className="mt-1 text-xs text-orange-800">
            Profile is stored as &ldquo;{row.profile_scientific_name}&rdquo;
          </div>
        )}
        {row.checklist_id === null && (
          <div className="mt-1 text-xs text-orange-800">Profile is not linked to a checklist entry</div>
        )}
        {row.source?.startsWith("Turterra") && (
          <div className="mt-1 text-xs text-gray-500">Not in the checklist</div>
        )}
        {/* Only once the database reports the count (migration 024) */}
        {typeof row.pending_followups === "number" && row.scientific_name && (
          <div className="mt-1 text-xs">
            <Link
              href={`/admin/follow-ups?taxon=${encodeURIComponent(row.scientific_name)}`}
              className={
                row.pending_followups > 0
                  ? "font-semibold text-orange-800 underline underline-offset-2 hover:text-orange-900"
                  : "text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-green-950"
              }
            >
              {row.pending_followups > 0
                ? `${row.pending_followups} follow-up${row.pending_followups === 1 ? "" : "s"} to do`
                : "Add a follow-up"}
            </Link>
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.family || "—"}</td>
      <td className="px-4 py-3 text-gray-700">{row.conservation_status || "—"}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[row.tracking_status]}`}
        >
          {TRACKING_STATUS_LABEL[row.tracking_status]}
        </span>
        {row.tracking_status === "skipped" && row.skip_reason && (
          <div className="mt-1 text-xs text-gray-500">{row.skip_reason}</div>
        )}
        {row.has_published_care_guide && (
          <div className="mt-1 text-xs text-gray-500">Has a care guide</div>
        )}
        {row.notes && <div className="mt-1 text-xs text-gray-500">{row.notes}</div>}
      </td>
      <td className="px-4 py-3">
        {sections ? (
          <div>
            <div className="mb-1.5 text-xs text-gray-600">
              {completeCount} of {sections.length} sections
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {sections.map((section) => (
                <li
                  key={section.key}
                  title={section.hint}
                  className={`rounded border px-1.5 py-0.5 text-xs ${SECTION_CHIP[section.state]}`}
                >
                  {section.label}
                  {section.detail && <span className="ml-1 opacity-80">{section.detail}</span>}
                  <span className="sr-only">: {SECTION_STATE_LABEL[section.state]}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
    </tr>
  );
}

"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import {
  type ActionResult,
  addFollowUp,
  deleteFollowUp,
  setFollowUpStatus,
  updateFollowUp,
} from "@/app/(main)/admin/follow-ups/actions";
import {
  FOLLOW_UP_KINDS,
  FOLLOW_UP_KIND_LABEL,
  FOLLOW_UP_LIMITS,
  FOLLOW_UP_STATUS_HINT,
  FOLLOW_UP_STATUS_LABEL,
  type FollowUp,
  type FollowUpInput,
  type FollowUpKind,
  type FollowUpStatus,
  type TaxonOption,
  followUpCoversTaxon,
  isPending,
} from "@/lib/admin/followups";

type StatusFilter = "pending" | FollowUpStatus | "all";

const STATUS_BADGE: Record<FollowUpStatus, string> = {
  open: "bg-orange-50 text-orange-800 border-orange-300",
  obtained: "bg-blue-50 text-blue-800 border-blue-200",
  done: "bg-green-100 text-green-900 border-green-300",
  dropped: "bg-gray-100 text-gray-600 border-gray-300",
};

const STATUS_ORDER: FollowUpStatus[] = ["obtained", "open", "done", "dropped"];

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700";

const CONNECTION_ERROR = "That did not go through. Check your connection and try again.";

const EMPTY_INPUT: FollowUpInput = { taxa: [], kind: "book", title: "", would_fill: "", url: "", notes: "" };

interface TaxonIndex {
  byName: Map<string, TaxonOption>;
  /** Number of checklist taxa in each genus. */
  genusSizes: Map<string, number>;
}

function buildIndex(taxa: TaxonOption[]): TaxonIndex {
  const byName = new Map<string, TaxonOption>();
  const genusSizes = new Map<string, number>();
  for (const taxon of taxa) {
    byName.set(taxon.scientificName, taxon);
    if (taxon.genus) genusSizes.set(taxon.genus, (genusSizes.get(taxon.genus) ?? 0) + 1);
  }
  return { byName, genusSizes };
}

export default function FollowUps({
  followUps,
  taxa,
  initialTaxon,
}: {
  followUps: FollowUp[];
  taxa: TaxonOption[];
  /** From ?taxon=: show only what applies to this taxon, and start the add form with it. */
  initialTaxon?: string;
}) {
  const index = useMemo(() => buildIndex(taxa), [taxa]);
  const focusTaxon = initialTaxon ? index.byName.get(initialTaxon) ?? null : null;
  const focusGenus = initialTaxon && !focusTaxon && index.genusSizes.has(initialTaxon) ? initialTaxon : null;
  const focusName = focusTaxon?.scientificName ?? focusGenus;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(followUps.length === 0 || focusName !== null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const inFocus = useMemo(() => {
    if (focusTaxon) return followUps.filter((f) => followUpCoversTaxon(f.taxa, focusTaxon));
    if (focusGenus) return followUps.filter((f) => f.taxa.includes(focusGenus));
    return followUps;
  }, [followUps, focusTaxon, focusGenus]);

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = { pending: 0, open: 0, obtained: 0, done: 0, dropped: 0, all: inFocus.length };
    for (const f of inFocus) {
      result[f.status] += 1;
      if (isPending(f.status)) result.pending += 1;
    }
    return result;
  }, [inFocus]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return inFocus
      .filter((f) => {
        if (statusFilter === "pending" ? !isPending(f.status) : statusFilter !== "all" && f.status !== statusFilter) {
          return false;
        }
        if (!needle) return true;
        const commonNames = f.taxa.map((t) => index.byName.get(t)?.commonName ?? "");
        return [f.title, f.would_fill, f.notes, ...f.taxa, ...commonNames]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
      .sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || b.created_at.localeCompare(a.created_at)
      );
  }, [inFocus, statusFilter, query, index]);

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "pending", label: "Still to do" },
    { value: "open", label: FOLLOW_UP_STATUS_LABEL.open },
    { value: "obtained", label: FOLLOW_UP_STATUS_LABEL.obtained },
    { value: "done", label: FOLLOW_UP_STATUS_LABEL.done },
    { value: "dropped", label: FOLLOW_UP_STATUS_LABEL.dropped },
    { value: "all", label: "All" },
  ];

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-5xl mx-auto px-4 lg:px-10 py-8">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-green-950 font-heading mb-4">Follow-ups</h1>
          <AdminNav current="/admin/follow-ups" />
          <p className="text-sm text-gray-600 max-w-3xl">
            Sources worth chasing for more detail than the profiles have now: a book about a species or genus, a paper
            that could not be read, an author to write to. File each one under the species, subspecies or genus it
            covers, and it shows on those rows of the species tracker until it is used or dropped.
          </p>
        </header>

        {focusName && (
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-950">
            <span>
              Showing what applies to <em>{focusName}</em>
              {focusTaxon?.commonName ? ` (${focusTaxon.commonName})` : focusGenus ? " (the whole genus)" : ""}.
            </span>
            <Link href="/admin/follow-ups" className="underline underline-offset-2 hover:text-green-800">
              Show all follow-ups
            </Link>
          </div>
        )}
        {initialTaxon && !focusName && (
          <div className="mb-4 rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-gray-800">
            &ldquo;{initialTaxon}&rdquo; is not a name on the checklist, so all follow-ups are shown.
          </div>
        )}

        {/* Add */}
        <section aria-label="Add a follow-up" className="mb-6">
          {adding ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-green-950 mb-3">Add a follow-up</h2>
              <FollowUpForm
                // A fresh form for each taxon the page is opened for
                key={focusName ?? "new"}
                index={index}
                taxa={taxa}
                initial={{ ...EMPTY_INPUT, taxa: focusName ? [focusName] : [] }}
                submitLabel="Add follow-up"
                onSubmit={addFollowUp}
                onDone={() => setAdding(false)}
                onCancel={followUps.length > 0 ? () => setAdding(false) : undefined}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded-lg bg-green-900 px-4 py-2 text-sm font-semibold text-white hover:bg-green-950 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
            >
              Add a follow-up
            </button>
          )}
        </section>

        {/* Filters */}
        <section aria-label="Filters" className="mb-4 space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {tabs.map((tab) => {
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
                    {counts[tab.value]}
                  </span>
                </button>
              );
            })}
          </div>
          <label className="flex flex-col text-xs text-gray-600 max-w-md">
            Search follow-ups
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, species or note"
              className={INPUT_CLASS}
            />
          </label>
          <p className="text-xs text-gray-600" aria-live="polite">
            Showing {visible.length} of {inFocus.length}
          </p>
        </section>

        {/* List */}
        <ul className="space-y-3">
          {visible.map((followUp) => (
            <li key={followUp.id} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              {editingId === followUp.id ? (
                <>
                  <h2 className="text-lg font-semibold text-green-950 mb-3">Edit follow-up</h2>
                  <FollowUpForm
                    index={index}
                    taxa={taxa}
                    initial={{
                      taxa: followUp.taxa,
                      kind: followUp.kind,
                      title: followUp.title,
                      would_fill: followUp.would_fill ?? "",
                      url: followUp.url ?? "",
                      notes: followUp.notes ?? "",
                    }}
                    submitLabel="Save changes"
                    onSubmit={(input) => updateFollowUp(followUp.id, input)}
                    onDone={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                </>
              ) : (
                <FollowUpCard followUp={followUp} index={index} onEdit={() => setEditingId(followUp.id)} />
              )}
            </li>
          ))}
        </ul>
        {visible.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {inFocus.length === 0
              ? focusName
                ? "Nothing filed for this taxon yet."
                : "No follow-ups yet."
              : "Nothing matches these filters."}
          </p>
        )}
      </div>
    </div>
  );
}

/** The names a follow-up is filed under, with common names and links to profiles. */
function TaxaList({ names, index }: { names: string[]; index: TaxonIndex }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {names.map((name) => {
        const taxon = index.byName.get(name);
        const genusSize = index.genusSizes.get(name);
        const detail = taxon?.commonName ?? (genusSize ? `genus, ${genusSize} on the checklist` : "not on the checklist");
        return (
          <li key={name} className="rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700">
            {taxon?.slug ? (
              <Link
                href={`/turtle-guide/${taxon.slug}`}
                className="underline decoration-gray-300 underline-offset-2 hover:decoration-green-700"
              >
                <em>{name}</em>
              </Link>
            ) : (
              <em>{name}</em>
            )}
            <span className="ml-1.5 text-gray-500">{detail}</span>
          </li>
        );
      })}
    </ul>
  );
}

function FollowUpCard({ followUp, index, onEdit }: { followUp: FollowUp; index: TaxonIndex; onEdit: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function run(action: () => Promise<ActionResult>) {
    setError(null);
    setPending(true);
    try {
      const result = await action();
      if (result.ok) router.refresh();
      else setError(result.error);
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setPending(false);
    }
  }

  const moves: { status: FollowUpStatus; label: string }[] =
    followUp.status === "open"
      ? [
          { status: "obtained", label: "I have it now" },
          { status: "done", label: "Used in the profile" },
          { status: "dropped", label: "Drop" },
        ]
      : followUp.status === "obtained"
        ? [
            { status: "done", label: "Used in the profile" },
            { status: "open", label: "Back to “to get”" },
            { status: "dropped", label: "Drop" },
          ]
        : [{ status: "open", label: "Reopen" }];

  return (
    <article aria-busy={pending} className={pending ? "opacity-60" : undefined}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
          {FOLLOW_UP_KIND_LABEL[followUp.kind]}
        </span>
        <span
          title={FOLLOW_UP_STATUS_HINT[followUp.status]}
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[followUp.status]}`}
        >
          {FOLLOW_UP_STATUS_LABEL[followUp.status]}
        </span>
        <span className="text-xs text-gray-500">
          Added {followUp.created_at.slice(0, 10)}
          {followUp.updated_at.slice(0, 10) !== followUp.created_at.slice(0, 10) &&
            `, changed ${followUp.updated_at.slice(0, 10)}`}
        </span>
      </div>

      <h2 className="text-base font-semibold text-green-950 break-words">{followUp.title}</h2>

      <div className="mt-2">
        <TaxaList names={followUp.taxa} index={index} />
      </div>

      {followUp.would_fill && (
        <p className="mt-3 text-sm text-gray-800 whitespace-pre-line">
          <span className="font-semibold">Might fill: </span>
          {followUp.would_fill}
        </p>
      )}
      {followUp.notes && <p className="mt-2 text-sm text-gray-600 whitespace-pre-line break-words">{followUp.notes}</p>}
      {followUp.url && (
        <p className="mt-2 text-sm break-all">
          <a
            href={followUp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-800 underline underline-offset-2 hover:text-green-950"
          >
            {followUp.url}
          </a>
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        {moves.map((move) => (
          <button
            key={move.status}
            type="button"
            disabled={pending}
            onClick={() => run(() => setFollowUpStatus(followUp.id, move.status))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:border-green-900 disabled:cursor-not-allowed"
          >
            {move.label}
          </button>
        ))}
        <span className="grow" />
        <button
          type="button"
          disabled={pending}
          onClick={onEdit}
          className="rounded-lg px-2 py-1.5 text-sm text-green-800 underline underline-offset-2 hover:text-green-950"
        >
          Edit
        </button>
        {confirmingDelete ? (
          <span className="flex flex-wrap items-center gap-2 text-sm text-gray-800">
            Delete for good?
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => deleteFollowUp(followUp.id))}
              className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-lg px-2 py-1.5 text-sm text-gray-700 underline underline-offset-2"
            >
              Keep
            </button>
          </span>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmingDelete(true)}
            className="rounded-lg px-2 py-1.5 text-sm text-red-700 underline underline-offset-2 hover:text-red-800"
          >
            Delete
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </article>
  );
}

function FollowUpForm({
  index,
  taxa,
  initial,
  submitLabel,
  onSubmit,
  onDone,
  onCancel,
}: {
  index: TaxonIndex;
  taxa: TaxonOption[];
  initial: FollowUpInput;
  submitLabel: string;
  onSubmit: (input: FollowUpInput) => Promise<ActionResult>;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const formId = useId();
  const [values, setValues] = useState<FollowUpInput>(initial);
  const [taxonDraft, setTaxonDraft] = useState("");
  const [taxonError, setTaxonError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const genera = useMemo(() => Array.from(index.genusSizes.keys()).sort(), [index]);

  function set<K extends keyof FollowUpInput>(key: K, value: FollowUpInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  /**
   * The names with whatever is typed in the name box added, or null (with a
   * message shown) when what is typed is not a checklist name. Accepts a
   * scientific name in any letter case, a genus, or an exact common name.
   */
  function withTypedTaxon(): string[] | null {
    const typed = taxonDraft.trim().replace(/\s+/g, " ");
    if (!typed) return values.taxa;
    const lower = typed.toLowerCase();
    const match =
      taxa.find((t) => t.scientificName.toLowerCase() === lower)?.scientificName ??
      genera.find((g) => g.toLowerCase() === lower) ??
      taxa.find((t) => t.commonName?.toLowerCase() === lower)?.scientificName;
    if (!match) {
      setTaxonError(`"${typed}" is not on the checklist. Pick a species, subspecies or genus from the suggestions.`);
      return null;
    }
    const names = values.taxa.includes(match) ? values.taxa : [...values.taxa, match];
    set("taxa", names);
    setTaxonDraft("");
    setTaxonError(null);
    return names;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    // Something may still be typed in the name box: take it, or stop and say why not.
    const names = withTypedTaxon();
    if (names === null) return;
    if (names.length === 0) {
      setTaxonError("Choose at least one species, subspecies or genus.");
      return;
    }
    const input = { ...values, taxa: names };
    setError(null);
    setPending(true);
    try {
      const result = await onSubmit(input);
      if (result.ok) {
        router.refresh();
        onDone();
        return;
      }
      setError(result.error);
    } catch {
      setError(CONNECTION_ERROR);
    }
    setPending(false);
  }

  const listId = `${formId}-taxa`;

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label htmlFor={`${formId}-taxon`} className="text-sm font-medium text-gray-800">
          Applies to
        </label>
        <p className="text-xs text-gray-500">
          A species also covers its subspecies. A genus on its own (for example Terrapene) covers everything in it.
        </p>
        {values.taxa.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {values.taxa.map((name) => (
              <li
                key={name}
                className="flex items-center gap-1 rounded-full border border-green-300 bg-green-100 py-0.5 pl-2.5 pr-1 text-xs text-green-950"
              >
                <em>{name}</em>
                <button
                  type="button"
                  onClick={() => set("taxa", values.taxa.filter((t) => t !== name))}
                  aria-label={`Remove ${name}`}
                  className="rounded-full px-1.5 text-sm leading-5 text-green-900 hover:bg-green-300"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-1 flex gap-2">
          <input
            id={`${formId}-taxon`}
            list={listId}
            value={taxonDraft}
            onChange={(e) => {
              setTaxonDraft(e.target.value);
              setTaxonError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                withTypedTaxon();
              }
            }}
            placeholder="Scientific name, common name or genus"
            autoComplete="off"
            aria-describedby={taxonError ? `${formId}-taxon-error` : undefined}
            aria-invalid={taxonError ? true : undefined}
            className={INPUT_CLASS.replace("mt-1 ", "")}
          />
          <button
            type="button"
            onClick={() => withTypedTaxon()}
            className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:border-green-900"
          >
            Add name
          </button>
        </div>
        <datalist id={listId}>
          {genera.map((genus) => (
            <option key={`g-${genus}`} value={genus}>
              genus
            </option>
          ))}
          {taxa.map((taxon) => (
            <option key={taxon.scientificName} value={taxon.scientificName}>
              {taxon.commonName ?? ""}
            </option>
          ))}
        </datalist>
        {taxonError && (
          <p id={`${formId}-taxon-error`} role="alert" className="mt-1 text-sm text-red-700">
            {taxonError}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <label className="text-sm font-medium text-gray-800">
          Kind
          <select
            value={values.kind}
            onChange={(e) => set("kind", e.target.value as FollowUpKind)}
            className={INPUT_CLASS}
          >
            {FOLLOW_UP_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {FOLLOW_UP_KIND_LABEL[kind]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-800">
          Title or citation
          <input
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={FOLLOW_UP_LIMITS.title}
            required
            placeholder="Author, year, title, publisher"
            className={INPUT_CLASS}
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-gray-800">
        What it might fill <span className="font-normal text-gray-500">(optional)</span>
        <textarea
          value={values.would_fill}
          onChange={(e) => set("would_fill", e.target.value)}
          maxLength={FOLLOW_UP_LIMITS.text}
          rows={2}
          placeholder="Which empty parts of the profile this could cover"
          className={INPUT_CLASS}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-800">
          Link <span className="font-normal text-gray-500">(optional)</span>
          <input
            type="url"
            value={values.url}
            onChange={(e) => set("url", e.target.value)}
            maxLength={FOLLOW_UP_LIMITS.url}
            placeholder="https://"
            className={INPUT_CLASS}
          />
        </label>
        <label className="block text-sm font-medium text-gray-800">
          Notes <span className="font-normal text-gray-500">(optional)</span>
          <textarea
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            maxLength={FOLLOW_UP_LIMITS.text}
            rows={1}
            placeholder="Where to find it, who mentioned it"
            className={INPUT_CLASS}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-green-900 px-4 py-2 text-sm font-semibold text-white hover:bg-green-950 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-2 py-2 text-sm text-gray-700 underline underline-offset-2 hover:text-green-950"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

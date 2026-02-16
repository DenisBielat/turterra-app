'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { reportContent } from '@/app/(main)/community/actions';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'off_topic', label: 'Off-topic' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'self_harm', label: 'Self-harm or dangerous activity' },
  { value: 'other', label: 'Other' },
] as const;

interface ReportDialogProps {
  contentType: 'post' | 'comment';
  contentId: number;
  onClose: () => void;
}

export function ReportDialog({ contentType, contentId, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setError(null);

    startTransition(() => {
      reportContent({
        contentType,
        contentId,
        reason,
        details: details || undefined,
      })
        .then(() => {
          setSuccess(true);
          setTimeout(onClose, 1500);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to submit report');
        });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-semibold text-green-950 mb-1">
          Report {contentType === 'post' ? 'Post' : 'Comment'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Help us understand the issue. Your report will be reviewed by moderators.
        </p>

        {success ? (
          <div className="text-center py-6">
            <p className="text-green-700 font-medium">
              Thank you for your report. We&apos;ll review it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <fieldset className="space-y-2 mb-4">
              <legend className="text-sm font-medium text-green-950 mb-2">
                Reason for reporting
              </legend>
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="text-green-700 focus:ring-green-600"
                  />
                  <span className="text-sm text-gray-700">{r.label}</span>
                </label>
              ))}
            </fieldset>

            <div className="mb-4">
              <label className="block text-sm font-medium text-green-950 mb-1">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Provide any context that may help reviewers..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-green-950 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 resize-none"
              />
            </div>

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !reason}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

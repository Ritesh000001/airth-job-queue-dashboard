import { useState } from 'react';

interface CreateJobModalProps {
  onClose: () => void;
  onCreate: (title: string, type: string) => Promise<void>;
}

export default function CreateJobModal({
  onClose,
  onCreate,
}: CreateJobModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !type.trim()) {
      return;
    }

    try {
      setLoading(true);
      await onCreate(title.trim(), type.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-[24px] border border-emerald-100 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-950">
              Create new job
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add a job to your processing queue.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Job title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Generate monthly report"
              maxLength={150}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Job type
            </label>

            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. report"
              maxLength={80}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim() || !type.trim()}
              className="flex-1 rounded-x bg-[#16803a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#126b31] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
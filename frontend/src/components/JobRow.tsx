import type { Job, JobStatus } from '../types/job';
import StatusBadge from './StatusBadge';

interface JobRowProps {
  job: Job;
  onStatusChange: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
  updating: boolean;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export default function JobRow({
  job,
  onStatusChange,
  onDelete,
  updating,
}: JobRowProps) {
  return (
    <div className="grid grid-cols-[minmax(220px,1.7fr)_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-100 px-6 py-4 last:border-0 hover:bg-gray-50/70">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">
          {job.title}
        </p>

        <p className="mt-1 truncate font-mono text-xs text-gray-400">
          {job.id.slice(0, 8)}...
        </p>
      </div>

      <div>
        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {job.type}
        </span>
      </div>

      <div>
        <StatusBadge status={job.status} />
      </div>

      <p className="text-sm text-gray-500">{formatDate(job.createdAt)}</p>

      <div className="flex items-center justify-end gap-2">
        {job.status === 'pending' && (
          <button
            disabled={updating}
            onClick={() => onStatusChange(job.id, 'running')}
            className="rounded-lg bg-gray-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            Run
          </button>
        )}

        {job.status === 'running' && (
          <>
            <button
              disabled={updating}
              onClick={() => onStatusChange(job.id, 'completed')}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              Complete
            </button>

            <button
              disabled={updating}
              onClick={() => onStatusChange(job.id, 'failed')}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              Fail
            </button>
          </>
        )}

        <button
          disabled={updating}
          onClick={() => onDelete(job.id)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
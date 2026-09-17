import type { JobStatus } from '../types/job';

interface StatusBadgeProps {
  status: JobStatus;
}

const styles: Record<JobStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  running: 'bg-emerald-50 text-[#16803a] ring-emerald-200',
  completed: 'bg-green-100 text-green-800 ring-green-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
};

const labels: Record<JobStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
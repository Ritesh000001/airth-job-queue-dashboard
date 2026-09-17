import { useEffect, useMemo, useState } from 'react';
import CreateJobModal from './components/CreateJobModal';
import JobRow from './components/JobRow';
import StatCard from './components/StatCard';
import StatusBadge from './components/StatusBadge';
import { createJob, deleteJob, getJobs, updateJobStatus } from './services/api';
import type { Job, JobStatus } from './types/job';

type Filter = 'all' | JobStatus;

const filters: { label: string; value: Filter }[] = [
  { label: 'All jobs', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Running', value: 'running' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState('');

  const loadJobs = async () => {
    try {
      setError('');
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load jobs.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const counts = useMemo(
    () => ({
      total: jobs.length,
      pending: jobs.filter((job) => job.status === 'pending').length,
      running: jobs.filter((job) => job.status === 'running').length,
      completed: jobs.filter((job) => job.status === 'completed').length,
      failed: jobs.filter((job) => job.status === 'failed').length,
    }),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    if (filter === 'all') {
      return jobs;
    }

    return jobs.filter((job) => job.status === filter);
  }, [jobs, filter]);

  const handleCreate = async (title: string, type: string) => {
    try {
      setError('');
      const job = await createJob({ title, type });

      setJobs((current) => [job, ...current]);
      setModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create job.',
      );
      throw err;
    }
  };

  const handleStatusChange = async (id: string, status: JobStatus) => {
    try {
      setError('');
      setUpdatingId(id);

      const updatedJob = await updateJobStatus(id, status);

      setJobs((current) =>
        current.map((job) => (job.id === id ? updatedJob : job)),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update job status.',
      );
      await loadJobs();
    } finally {
      setUpdatingId('');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this job?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setUpdatingId(id);

      await deleteJob(id);

      setJobs((current) => current.filter((job) => job.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to delete job.',
      );
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8f4] text-[#172018]">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16803a] text-sm font-black text-white shadow-sm">
              A
            </div>

            <div>
              <p className="text-base font-extrabold tracking-tight text-[#16803a]">
                airth
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400">
                Job Queue
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs font-medium text-gray-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            System operational
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-[28px] border border-emerald-100 bg-white px-7 py-8 shadow-sm sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-24 h-48 w-48 rounded-full bg-lime-100/60 blur-3xl" />
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#16803a]">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#16803a]" />
              Queue management
            </div>

            <h1 className="relative text-3xl font-extrabold tracking-tight text-[#172018] sm:text-4xl lg:text-5xl">
              Job Queue Dashboard
            </h1>

            <p className="relative mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
               Monitor, manage and track background jobs from a clean,
               centralized workspace.
            </p>
          </div>
          

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16803a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#126b31] hover:shadow-lg"
          >
            <span className="text-lg leading-none">+</span>
            Create job
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={() => setError('')}
              className="font-semibold text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total jobs"
            value={counts.total}
            description="All jobs in queue"
            icon="Σ"
          />

          <StatCard
            label="Pending"
            value={counts.pending}
            description="Waiting to run"
            icon="○"
          />

          <StatCard
            label="Running"
            value={counts.running}
            description="Currently processing"
            icon="↻"
          />

          <StatCard
            label="Completed"
            value={counts.completed}
            description="Successfully finished"
            icon="✓"
          />

          <StatCard
            label="Failed"
            value={counts.failed}
            description="Require attention"
            icon="!"
          />
        </section>

        {/* Jobs */}
        <section className="overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 pt-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Jobs</h2>
                <p className="mt-1 text-xs text-gray-400">
                  {filteredJobs.length} job
                  {filteredJobs.length === 1 ? '' : 's'} displayed
                </p>
              </div>

              <button
                onClick={loadJobs}
                className="self-start rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-[#16803a] transition hover:bg-emerald-100"
              >
                ↻ Refresh
              </button>
            </div>

            <div className="flex gap-1 overflow-x-auto">
              {filters.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`whitespace-nowrap rounded-t-lg px-4 py-3 text-xs font-semibold transition ${
                    filter === item.value
                      ? 'border-b-2 border-gray-950 text-gray-950'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-950" />
                Loading jobs...
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-xl">
                ⌁
              </div>

              <h3 className="font-semibold text-gray-900">
                No jobs found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-400">
                {filter === 'all'
                  ? 'Create your first job to start building your queue.'
                  : `There are no ${filter} jobs right now.`}
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden grid-cols-[minmax(220px,1.7fr)_1fr_1fr_1fr_auto] gap-4 border-b border-gray-100 bg-[#f7faf6] px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 lg:grid">
                <span>Job</span>
                <span>Type</span>
                <span>Status</span>
                <span>Created</span>
                <span>Actions</span>
              </div>

              <div className="hidden lg:block">
                {filteredJobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    updating={updatingId === job.id}
                  />
                ))}
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 lg:hidden">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {job.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {job.type}
                        </p>
                      </div>

                      <StatusBadge status={job.status} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.status === 'pending' && (
                        <button
                          disabled={updatingId === job.id}
                          onClick={() =>
                            handleStatusChange(job.id, 'running')
                          }
                          className="rounded-lg bg-[#16803a] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#126b31] disabled:opacity-50"
                        >
                          Run
                        </button>
                      )}

                      {job.status === 'running' && (
                        <>
                          <button
                            disabled={updatingId === job.id}
                            onClick={() =>
                              handleStatusChange(job.id, 'completed')
                            }
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Complete
                          </button>

                          <button
                            disabled={updatingId === job.id}
                            onClick={() =>
                              handleStatusChange(job.id, 'failed')
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Fail
                          </button>
                        </>
                      )}

                      <button
                        disabled={updatingId === job.id}
                        onClick={() => handleDelete(job.id)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <footer className="py-8 text-center text-xs text-gray-400">
          Built with React, Tailwind CSS, NestJS & PostgreSQL
        </footer>
      </main>

      {modalOpen && (
        <CreateJobModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

export default App;
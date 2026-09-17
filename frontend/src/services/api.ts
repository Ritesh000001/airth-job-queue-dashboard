import type { CreateJobRequest, Job, JobStatus } from '../types/job';

const API_URL = import.meta.env.VITE_API_URL;

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'Something went wrong';

    try {
      const data = await response.json();

      if (Array.isArray(data.message)) {
        message = data.message.join(', ');
      } else if (data.message) {
        message = data.message;
      }
    } catch {
      // default error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const getJobs = () => request<Job[]>('/jobs');

export const createJob = (data: CreateJobRequest) =>
  request<Job>('/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateJobStatus = (id: string, status: JobStatus) =>
  request<Job>(`/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const deleteJob = (id: string) =>
  request<void>(`/jobs/${id}`, {
    method: 'DELETE',
  });
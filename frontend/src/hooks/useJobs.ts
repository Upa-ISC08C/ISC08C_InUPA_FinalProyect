import { useJobsStore } from "../store/jobsStore";

export function useJobs() {
  const {
    items,
    applications,
    filters,
    status,
    applicationsStatus,
    error,
    setFilters,
    fetchJobs,
    applyToJob,
    fetchMyApplications,
  } = useJobsStore();

  return {
    jobs: items,
    applications,
    filters,
    status,
    applicationsStatus,
    error,
    setFilters,
    fetchJobs,
    applyToJob,
    fetchMyApplications,
  };
}

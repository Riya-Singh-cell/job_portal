import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiMapPin, FiSliders } from 'react-icons/fi';
import { jobsAPI } from '../services/api';
import JobCard from '../components/ui/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../utils/constants';

// Debounce helper
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    minSalary: '',
    maxSalary: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
  });

  const debouncedKeyword = useDebounce(filters.keyword, 400);
  const debouncedLocation = useDebounce(filters.location, 400);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        keyword: debouncedKeyword,
        location: debouncedLocation,
        jobType: filters.jobType,
        experienceLevel: filters.experienceLevel,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page,
        limit: 12,
      };
      // Remove empty values
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await jobsAPI.getJobs(params);
      setJobs(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, debouncedLocation, filters.jobType, filters.experienceLevel, filters.minSalary, filters.maxSalary, filters.sortBy, filters.sortOrder, filters.page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '', location: '', jobType: '', experienceLevel: '',
      minSalary: '', maxSalary: '', sortBy: 'createdAt', sortOrder: 'desc', page: 1,
    });
  };

  const activeFilterCount = [
    filters.jobType, filters.experienceLevel, filters.minSalary, filters.maxSalary,
  ].filter(Boolean).length;

  return (
    <div className="pt-20 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Browse Jobs</h1>
          {pagination && (
            <p className="text-slate-500 text-sm mt-1">
              {pagination.totalItems.toLocaleString()} jobs found
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 input">
              <FiSearch className="text-slate-400 w-4 h-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills, or keywords..."
                value={filters.keyword}
                onChange={(e) => updateFilter('keyword', e.target.value)}
                className="flex-1 outline-none bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400 text-sm"
              />
              {filters.keyword && (
                <button onClick={() => updateFilter('keyword', '')} className="text-slate-400 hover:text-slate-600">
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-1 input">
              <FiMapPin className="text-slate-400 w-4 h-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="City, state, or Remote"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="flex-1 outline-none bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400 text-sm"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`btn-outline gap-2 whitespace-nowrap ${activeFilterCount > 0 ? 'border-primary-500 text-primary-600' : ''}`}
            >
              <FiSliders className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Job Type */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">Job Type</label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => updateFilter('jobType', e.target.value)}
                      className="input text-sm py-2"
                    >
                      <option value="">All Types</option>
                      {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">Experience</label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => updateFilter('experienceLevel', e.target.value)}
                      className="input text-sm py-2"
                    >
                      <option value="">All Levels</option>
                      {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Salary min */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">Min Salary (USD)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={filters.minSalary}
                      onChange={(e) => updateFilter('minSalary', e.target.value)}
                      className="input text-sm py-2"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">Sort By</label>
                    <select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
                      }}
                      className="input text-sm py-2"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="views-desc">Most Viewed</option>
                      <option value="salary.min-desc">Highest Salary</option>
                    </select>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <div className="mt-3 flex justify-end">
                    <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 card">
            <FiSearch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">No jobs found</h3>
            <p className="text-slate-500 text-sm mb-4">Try adjusting your search filters or keywords.</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {jobs.map((job) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <JobCard job={job} onSaveToggle={fetchJobs} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => updateFilter('page', page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                          filters.page === page
                            ? 'bg-primary-600 text-white'
                            : 'btn-outline'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;

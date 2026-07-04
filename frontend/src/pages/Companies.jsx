import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiUsers, FiExternalLink } from 'react-icons/fi';
import { companiesAPI } from '../services/api';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await companiesAPI.getAll({ search, limit: 20 });
        setCompanies(res.data.data || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetch, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="pt-20 pb-12">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Explore Companies</h1>
          <p className="text-slate-500">Discover great companies and their open positions</p>
        </div>

        <div className="relative max-w-md mb-8">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="skeleton w-14 h-14 rounded-xl" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16 card">
            <p className="text-slate-500">No companies found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map((company, i) => (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100 dark:border-slate-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-600">{company.name[0]}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-primary-600 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-slate-500">{company.industry || 'Technology'}</p>
                  </div>
                </div>

                {company.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{company.description}</p>
                )}

                <div className="space-y-1.5 text-xs text-slate-400">
                  {company.location && (
                    <div className="flex items-center gap-1.5">
                      <FiMapPin className="w-3 h-3" />{company.location}
                    </div>
                  )}
                  {company.employeeCount && (
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="w-3 h-3" />{company.employeeCount} employees
                    </div>
                  )}
                </div>

                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1 text-xs text-primary-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiExternalLink className="w-3 h-3" />Visit website
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;

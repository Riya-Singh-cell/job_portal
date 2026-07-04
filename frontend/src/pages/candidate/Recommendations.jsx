import React, { useEffect, useState } from 'react';
import { FiStar, FiZap } from 'react-icons/fi';
import { userAPI } from '../../services/api';
import JobCard from '../../components/ui/JobCard';
import { JobCardSkeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await userAPI.getRecommendations();
        setRecommendations(res.data.data || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FiZap className="text-amber-500" /> AI Job Matches
        </h1>
        <p className="text-slate-500 text-sm mt-1">Jobs matched to your skills and experience</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-16 card">
          <FiStar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">No matches yet</h3>
          <p className="text-slate-500 text-sm mb-4">
            Complete your profile with skills and experience to get personalized recommendations.
          </p>
          <Link to="/candidate/profile" className="btn-primary">Complete Profile</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((job) => (
            <div key={job._id} className="relative">
              {job.matchScore > 70 && (
                <div className="absolute -top-2 -right-2 z-10 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {job.matchScore}% match
                </div>
              )}
              <JobCard job={job} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;

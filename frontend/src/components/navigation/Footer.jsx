import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FiBriefcase className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-gradient">JobPortal</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Find your dream job or the perfect candidate. Built with modern technology for today's workforce.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="p-2 text-slate-400 hover:text-primary-600 transition-colors" aria-label="GitHub">
                <FiGithub className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 text-slate-400 hover:text-primary-600 transition-colors" aria-label="Twitter">
                <FiTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 text-slate-400 hover:text-primary-600 transition-colors" aria-label="LinkedIn">
                <FiLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'For Candidates', links: [{ label: 'Browse Jobs', to: '/jobs' }, { label: 'Companies', to: '/companies' }, { label: 'Sign Up', to: '/register' }] },
            { title: 'For Recruiters', links: [{ label: 'Post a Job', to: '/register' }, { label: 'Sign Up', to: '/register' }] },
            { title: 'Company', links: [{ label: 'About', to: '/' }, { label: 'Blog', to: '/' }, { label: 'Contact', to: '/' }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

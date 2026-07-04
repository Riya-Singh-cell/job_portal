export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
export const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'];
export const SKILLS_LIST = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js',
  'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'PHP', 'Laravel', 'Ruby on Rails',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'Git', 'CI/CD', 'REST APIs', 'GraphQL', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS',
  'Figma', 'Adobe XD', 'Machine Learning', 'Data Science', 'SQL', 'Golang', 'Rust',
];

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  shortlisted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  interviewing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const INDUSTRY_LIST = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Media',
  'Manufacturing', 'Consulting', 'Design', 'Artificial Intelligence', 'Cybersecurity',
  'Marketing', 'Real Estate', 'Automotive', 'Telecommunications',
];

export const EMPLOYEE_COUNT_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) return 'Salary not disclosed';
  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n;
  const currency = salary.currency || 'USD';
  if (salary.min && salary.max) {
    return `${currency} ${fmt(salary.min)} – ${fmt(salary.max)}/yr`;
  }
  if (salary.min) return `From ${currency} ${fmt(salary.min)}/yr`;
  return `Up to ${currency} ${fmt(salary.max)}/yr`;
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'], [60, 'minute'],
  ];
  for (const [secs, unit] of intervals) {
    const interval = Math.floor(seconds / secs);
    if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

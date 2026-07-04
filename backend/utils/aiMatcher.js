/**
 * @file utils/aiMatcher.js
 * @description AI-powered resume matching and job recommendation utilities.
 * Uses a keyword/skill-based scoring algorithm (no external AI API needed).
 */

/**
 * Calculate a match score between a candidate's profile and a job posting.
 * Scores are calculated based on skill overlap, experience level, and keyword matching.
 *
 * @param {Object} candidate - Candidate user document (with profile populated)
 * @param {Object} job - Job document
 * @returns {number} Match score between 0 and 100
 */
const calculateMatchScore = (candidate, job) => {
  let score = 0;
  const weights = {
    skills: 50,
    experience: 25,
    keywords: 25,
  };

  // ── Skill Matching (50 points) ──────────────────────────────────────────────
  const candidateSkills = (candidate.profile?.skills || []).map((s) => s.toLowerCase().trim());
  const jobRequirements = (job.requirements || []).map((r) => r.toLowerCase().trim());

  if (candidateSkills.length > 0 && jobRequirements.length > 0) {
    const matchingSkills = candidateSkills.filter((skill) =>
      jobRequirements.some(
        (req) => req.includes(skill) || skill.includes(req) || levenshteinSimilarity(skill, req) > 0.8
      )
    );
    const skillScore = (matchingSkills.length / jobRequirements.length) * weights.skills;
    score += Math.min(skillScore, weights.skills);
  }

  // ── Experience Level Matching (25 points) ──────────────────────────────────
  const experienceMap = { Entry: 0, Mid: 2, Senior: 5, Lead: 8 };
  const requiredExp = experienceMap[job.experienceLevel] || 0;
  const candidateExpYears = calculateExperienceYears(candidate.profile?.experience || []);

  if (candidateExpYears >= requiredExp) {
    score += weights.experience;
  } else if (candidateExpYears >= requiredExp * 0.7) {
    score += weights.experience * 0.7;
  } else if (candidateExpYears >= requiredExp * 0.5) {
    score += weights.experience * 0.5;
  }

  // ── Keyword Matching in Bio/Experience (25 points) ──────────────────────────
  const jobKeywords = extractKeywords(job.description + ' ' + job.title);
  const candidateText = [
    candidate.profile?.bio || '',
    ...(candidate.profile?.experience || []).map((e) => e.description || ''),
    ...(candidate.profile?.certifications || []).map((c) => c.name || ''),
  ]
    .join(' ')
    .toLowerCase();

  const matchingKeywords = jobKeywords.filter((kw) => candidateText.includes(kw));
  const keywordScore =
    jobKeywords.length > 0
      ? (matchingKeywords.length / jobKeywords.length) * weights.keywords
      : 0;
  score += keywordScore;

  return Math.round(Math.min(score, 100));
};

/**
 * Get job recommendations for a candidate based on their profile.
 * @param {Object} candidate - Candidate user document
 * @param {Object[]} jobs - Array of available job documents
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Object[]} Sorted array of jobs with match scores
 */
const getJobRecommendations = (candidate, jobs, limit = 10) => {
  const scored = jobs
    .filter((job) => job.status === 'open')
    .map((job) => ({
      ...job.toObject ? job.toObject() : job,
      matchScore: calculateMatchScore(candidate, job),
    }))
    .filter((job) => job.matchScore > 20) // Only show relevant matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calculate total years of professional experience from experience entries.
 * @param {Object[]} experience - Array of experience sub-documents
 * @returns {number} Total years of experience
 */
const calculateExperienceYears = (experience) => {
  let totalMonths = 0;

  experience.forEach((exp) => {
    const start = new Date(exp.from);
    const end = exp.current ? new Date() : (exp.to ? new Date(exp.to) : new Date());
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  });

  return totalMonths / 12;
};

/**
 * Extract meaningful keywords from text by removing stop words.
 * @param {string} text - Input text
 * @returns {string[]} Array of meaningful keywords
 */
const extractKeywords = (text) => {
  const stopWords = new Set([
    'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'a', 'an',
    'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'we', 'you', 'our', 'will', 'have', 'has', 'your',
    'this', 'that', 'it', 'as', 'not', 'can', 'all', 'more', 'than',
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index); // unique
};

/**
 * Simple Levenshtein-based similarity score between two strings (0-1).
 * @param {string} a
 * @param {string} b
 * @returns {number} Similarity score (1 = identical)
 */
const levenshteinSimilarity = (a, b) => {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
};

const levenshteinDistance = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[a.length][b.length];
};

module.exports = { calculateMatchScore, getJobRecommendations, calculateExperienceYears };

/**
 * @file utils/apiResponse.js
 * @description Standardized API response helpers.
 */

/**
 * Send a success response.
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response payload
 * @param {Object} [pagination] - Optional pagination metadata
 */
const successResponse = (res, statusCode, message, data = null, pagination = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} [errors] - Optional validation errors
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Build pagination metadata.
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total item count
 * @returns {Object} Pagination metadata
 */
const buildPagination = (page, limit, total) => ({
  currentPage: page,
  totalPages: Math.ceil(total / limit),
  totalItems: total,
  itemsPerPage: limit,
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

module.exports = { successResponse, errorResponse, buildPagination };

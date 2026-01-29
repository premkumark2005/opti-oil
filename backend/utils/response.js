/**
 * Standard success response helper
 */
export const sendSuccess = (res, statusCode = 200, data = {}, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standard error response helper
 */
export const sendError = (res, statusCode = 500, message = 'Error occurred') => {
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

/**
 * Paginated response helper
 */
export const sendPaginatedResponse = (
  res,
  data,
  page,
  limit,
  total,
  message = 'Data retrieved successfully'
) => {
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      pageSize: parseInt(limit),
      totalItems: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
};

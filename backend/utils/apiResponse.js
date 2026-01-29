/**
 * Standardized API Response Utility
 * Ensures consistent response structure across all endpoints
 */

class ApiResponse {
  static success(res, { data = null, message = 'Success', statusCode = 200, meta = null }) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  static error(res, { message = 'An error occurred', statusCode = 500, errors = null, stack = null }) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    // Include stack trace only in development
    if (process.env.NODE_ENV === 'development' && stack) {
      response.stack = stack;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, { data = null, message = 'Resource created successfully' }) {
    return this.success(res, { data, message, statusCode: 201 });
  }

  static noContent(res, { message = 'Operation successful' }) {
    return res.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    });
  }

  static badRequest(res, { message = 'Bad request', errors = null }) {
    return this.error(res, { message, statusCode: 400, errors });
  }

  static unauthorized(res, { message = 'Unauthorized access' }) {
    return this.error(res, { message, statusCode: 401 });
  }

  static forbidden(res, { message = 'Access forbidden' }) {
    return this.error(res, { message, statusCode: 403 });
  }

  static notFound(res, { message = 'Resource not found' }) {
    return this.error(res, { message, statusCode: 404 });
  }

  static conflict(res, { message = 'Resource conflict' }) {
    return this.error(res, { message, statusCode: 409 });
  }

  static validationError(res, { message = 'Validation failed', errors }) {
    return this.error(res, { message, statusCode: 422, errors });
  }

  static paginated(res, { data, page, limit, total, message = 'Success' }) {
    return this.success(res, {
      data,
      message,
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  }
}

export default ApiResponse;

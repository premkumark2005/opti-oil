/**
 * Logger Utility
 * Centralized logging for the application
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class Logger {
  static formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let formatted = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      formatted += '\n' + JSON.stringify(data, null, 2);
    }
    
    return formatted;
  }

  static info(message, data = null) {
    console.log(
      `${colors.blue}${this.formatMessage('INFO', message, data)}${colors.reset}`
    );
  }

  static success(message, data = null) {
    console.log(
      `${colors.green}${this.formatMessage('SUCCESS', message, data)}${colors.reset}`
    );
  }

  static warn(message, data = null) {
    console.warn(
      `${colors.yellow}${this.formatMessage('WARN', message, data)}${colors.reset}`
    );
  }

  static error(message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      ...(error.response?.data || {})
    } : null;
    
    console.error(
      `${colors.red}${this.formatMessage('ERROR', message, errorData)}${colors.reset}`
    );
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${colors.magenta}${this.formatMessage('DEBUG', message, data)}${colors.reset}`
      );
    }
  }

  static http(req, res, duration) {
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    
    let color = colors.green;
    if (statusCode >= 400 && statusCode < 500) color = colors.yellow;
    if (statusCode >= 500) color = colors.red;
    
    console.log(
      `${color}[HTTP] ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip}${colors.reset}`
    );
  }
}

// HTTP request logger middleware
const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    Logger.http(req, res, duration);
  });
  
  next();
};

export { Logger, httpLogger };

import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';
import { ragQuery } from '../services/ragQueryService.js';
import { Logger } from '../utils/logger.js';

export const processQuery = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return next(new AppError('Message is required', HTTP_STATUS.BAD_REQUEST));
  }

  const responseText = await ragQuery(message.trim(), req.user);

  sendSuccess(res, HTTP_STATUS.OK, {
    response: responseText
  });
});


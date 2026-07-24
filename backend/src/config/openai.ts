/**
 * OpenAI API configuration and client
 */

import OpenAI from 'openai';
import { envConfig } from './env';
import logger from '../utils/logger';
import { ExternalAPIError } from '../utils/errors';

/**
 * Initialize OpenAI client
 */
export const openaiClient = new OpenAI({
  apiKey: envConfig.openai.apiKey,
});

/**
 * System prompt for log analysis
 */
export const LOG_ANALYSIS_SYSTEM_PROMPT = `You are an expert IT system administrator and troubleshooting specialist. Your task is to analyze system and application logs to identify issues.

When analyzing logs, you should:
1. Identify the detected problem/error
2. Determine the root cause
3. Propose concrete solutions/actions
4. Rate your confidence level (0.0-1.0) based on the clarity of the evidence
5. Provide the response in JSON format

Respond with a JSON object containing these fields:
{
  "detected_problem": "description of the problem",
  "root_cause": "description of the root cause",
  "proposed_actions": [
    {
      "action": "description of action",
      "type": "restart_service|clear_cache|update_config|restart_server|check_resources|update_logs|other",
      "parameters": {"key": "value"},
      "priority": "high|medium|low"
    }
  ],
  "confidence_level": 0.8,
  "summary": "brief summary"
}`;

/**
 * Analyze logs using OpenAI
 */
export const analyzeLogs = async (logContent: string): Promise<any> => {
  try {
    if (!logContent || logContent.trim().length === 0) {
      throw new ExternalAPIError('OpenAI', 'Log content cannot be empty');
    }

    const message = await openaiClient.messages.create({
      model: envConfig.openai.model,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Please analyze the following logs:\n\n${logContent}`,
        },
      ],
      system: LOG_ANALYSIS_SYSTEM_PROMPT,
    });

    // Extract text content from response
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new ExternalAPIError('OpenAI', 'No text response received');
    }

    // Parse JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new ExternalAPIError(
        'OpenAI',
        'Could not parse JSON response from OpenAI',
      );
    }

    const analysisResult = JSON.parse(jsonMatch[0]);
    logger.info('Log analysis completed successfully');

    return analysisResult;
  } catch (error) {
    logger.error('Error analyzing logs with OpenAI:', error);
    if (error instanceof ExternalAPIError) {
      throw error;
    }
    throw new ExternalAPIError(
      'OpenAI',
      error instanceof Error ? error.message : 'Unknown error occurred',
    );
  }
};

/**
 * Validate OpenAI configuration
 */
export const validateOpenAIConfig = (): void => {
  if (!envConfig.openai.apiKey) {
    throw new ExternalAPIError('OpenAI', 'API key is not configured');
  }
  logger.info('✅ OpenAI configuration validated');
};

export default openaiClient;

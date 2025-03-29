/**
 * Audio Converter API Service
 * 
 * This module provides a TypeScript interface for interacting with the audio converter backend API.
 * It handles file uploads, format conversion, and conversion cancellation.
 * 
 * @module api
 */

import axios from 'axios';

/** Base URL for the API server */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

/**
 * Response interface for conversion requests
 * @interface ConversionResponse
 */
export interface ConversionResponse {
  /** Whether the conversion was successful */
  success: boolean;
  /** URL to download the converted file */
  download_url?: string;
  /** Unique identifier for the conversion process */
  conversion_id?: string;
  /** Error message if conversion failed */
  error?: string;
}

/**
 * Converts an audio file to the specified format
 * 
 * @param file - The audio file to convert
 * @param format - Target format (mp3, wav, ogg, m4a, flac)
 * @param activationBytes - Optional activation bytes for AAX files
 * @returns Promise<ConversionResponse> - Response containing download URL or error
 * 
 * @example
 * ```typescript
 * const response = await convertAudio(file, 'mp3', '1234-5678');
 * if (response.success) {
 *   window.open(response.download_url);
 * }
 * ```
 */
export const convertAudio = async (
  file: File,
  format: string,
  activationBytes?: string
): Promise<ConversionResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    if (activationBytes) {
      formData.append('activation_bytes', activationBytes);
    }

    const response = await axios.post<ConversionResponse>(
      `${API_BASE_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ConversionResponse;
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
};

/**
 * Cancels an ongoing conversion process
 * 
 * @param conversionId - ID of the conversion to cancel
 * @returns Promise<boolean> - Whether the cancellation was successful
 * 
 * @example
 * ```typescript
 * if (await cancelConversion(conversionId)) {
 *   console.log('Conversion cancelled successfully');
 * }
 * ```
 */
export const cancelConversion = async (conversionId: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_BASE_URL}/cancel/${conversionId}`);
    return true;
  } catch (error) {
    console.error('Error cancelling conversion:', error);
    return false;
  }
}; 
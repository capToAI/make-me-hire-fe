import type { ResumeState } from "./types";
import { normalizeResumeState } from "./normalizeResume";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:3001";

export interface ExtractResumeResponse {
  success: boolean;
  data?: ResumeState;
  error?: string;
}

/**
 * Uploads a resume PDF file to the backend `/resume-builder/extract` endpoint
 * and returns the normalized ResumeState.
 */
export async function extractResumeFromPdf(
  file: File
): Promise<ExtractResumeResponse> {
  if (!file) {
    return { success: false, error: "No file was selected." };
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return {
      success: false,
      error: "Invalid file type. Please upload a valid PDF document (.pdf).",
    };
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "File is too large. Maximum supported PDF size is 10MB.",
    };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/resume-builder/extract`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Server responded with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : errorData.message;
        }
      } catch {
        // use fallback status message if response is not JSON
      }
      return { success: false, error: errorMessage };
    }

    const rawData = await response.json();
    const normalizedData = normalizeResumeState(rawData);

    return {
      success: true,
      data: normalizedData,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to connect to the resume extraction service. Please check your connection.";
    return {
      success: false,
      error: `Network / server connection error: ${message}`,
    };
  }
}

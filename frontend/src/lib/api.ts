import type { ResumeListItem, ResumeState, SavedResume } from "./types";
import { normalizeResumeState } from "./normalizeResume";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:3001";

export interface ExtractResumeResponse {
  success: boolean;
  data?: ResumeState;
  error?: string;
}

export interface GeneratePdfOptions {
  html: string;
  format?: "letter" | "a4";
  fileName?: string;
}

/**
 * Sends self-contained resume HTML to the backend `/resume-builder/generate-pdf` endpoint
 * to render a high-fidelity, text-selectable vector PDF using headless Chromium.
 */
export async function generatePdfFromServer(
  options: GeneratePdfOptions
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/resume-builder/generate-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      html: options.html,
      format: options.format || "letter",
      fileName: options.fileName || "Resume.pdf",
    }),
  });

  if (!response.ok) {
    let errorMessage = `Server failed to generate PDF (HTTP ${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message;
      }
    } catch {
      // response might not be JSON
    }
    throw new Error(errorMessage);
  }

  return response.blob();
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

export interface RefineSummaryData {
  oldSummary: string;
  newSummary: string;
}

export interface RefineSummaryResponse {
  success: boolean;
  data?: RefineSummaryData;
  error?: string;
}

/**
 * Sends current summary text to the backend `/resume-builder/refine-summary` endpoint
 * to produce an elevated, professional version without altering factual data.
 */
export async function refineSummaryWithAi(
  summary: string
): Promise<RefineSummaryResponse> {
  const trimmed = summary.trim();
  if (!trimmed) {
    return {
      success: false,
      error: "Please enter a summary first before refining with AI.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/resume-builder/refine-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ summary: trimmed }),
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
        // fallback to default status error
      }
      return { success: false, error: errorMessage };
    }

    const resJson = await response.json();
    if (!resJson || typeof resJson.newSummary !== "string" || !resJson.newSummary.trim()) {
      return {
        success: false,
        error: "AI refinement service returned an invalid or empty response.",
      };
    }

    return {
      success: true,
      data: {
        oldSummary: resJson.oldSummary || trimmed,
        newSummary: resJson.newSummary.trim(),
      },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to connect to the summary refinement service. Please check your connection.";
    return {
      success: false,
      error: `Network / server connection error: ${message}`,
    };
  }
}

/**
 * Fetches the authenticated user's list of saved resumes.
 */
export async function fetchUserResumes(): Promise<{
  success: boolean;
  data?: ResumeListItem[];
  error?: string;
}> {
  try {
    const res = await fetch("/api/resumes", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error:
          errJson.message ||
          errJson.error ||
          `Server responded with status ${res.status}`,
      };
    }

    const list = await res.json();
    return { success: true, data: Array.isArray(list) ? list : [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load resumes";
    return { success: false, error: msg };
  }
}

/**
 * Fetches a specific resume by its ID for editing.
 */
export async function fetchResumeById(
  id: string
): Promise<{ success: boolean; data?: SavedResume; error?: string }> {
  try {
    const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error:
          errJson.message ||
          errJson.error ||
          `Failed to fetch resume (status ${res.status})`,
      };
    }

    const resume: SavedResume = await res.json();
    if (resume?.data) {
      resume.data = normalizeResumeState(resume.data);
    }
    return { success: true, data: resume };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load resume";
    return { success: false, error: msg };
  }
}

/**
 * Creates a new resume record in the database.
 */
export async function createResumeRecord(payload: {
  name?: string;
  position?: string;
  data?: ResumeState;
}): Promise<{ success: boolean; data?: SavedResume; error?: string }> {
  try {
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error:
          errJson.message ||
          errJson.error ||
          `Failed to create resume (status ${res.status})`,
      };
    }

    const saved: SavedResume = await res.json();
    if (saved?.data) {
      saved.data = normalizeResumeState(saved.data);
    }
    return { success: true, data: saved };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create resume";
    return { success: false, error: msg };
  }
}

/**
 * Updates an existing resume record in the database.
 */
export async function updateResumeRecord(
  id: string,
  payload: {
    name?: string;
    position?: string;
    data?: ResumeState;
  }
): Promise<{ success: boolean; data?: SavedResume; error?: string }> {
  try {
    const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error:
          errJson.message ||
          errJson.error ||
          `Failed to save resume (status ${res.status})`,
      };
    }

    const updated: SavedResume = await res.json();
    return { success: true, data: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save resume";
    return { success: false, error: msg };
  }
}

/**
 * Deletes a resume record from the database.
 */
export async function deleteResumeRecord(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error:
          errJson.message ||
          errJson.error ||
          `Failed to delete resume (status ${res.status})`,
      };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete resume";
    return { success: false, error: msg };
  }
}



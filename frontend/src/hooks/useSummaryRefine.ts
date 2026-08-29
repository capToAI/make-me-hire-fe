import { useState, useCallback } from "react";

import { refineSummaryWithAi, type RefineSummaryData } from "@/lib/api";

export interface UseSummaryRefineReturn {
  isRefining: boolean;
  isReviewOpen: boolean;
  errorMessage: string | null;
  reviewData: RefineSummaryData | null;
  refineSummary: (currentSummary: string) => Promise<boolean>;
  applyNewSummary: (onApply: (newSummary: string) => void) => void;
  skipRefinement: () => void;
  clearError: () => void;
}

/**
 * Custom hook to orchestrate AI summary refinement requests, comparison modal state,
 * and error handling.
 */
export function useSummaryRefine(): UseSummaryRefineReturn {
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<RefineSummaryData | null>(null);

  const refineSummary = useCallback(
    async (currentSummary: string): Promise<boolean> => {
      const trimmed = currentSummary.trim();
      if (!trimmed) {
        setErrorMessage("Please enter a summary first before refining with AI.");
        return false;
      }

      if (isRefining) {
        return false; // Prevent duplicate requests
      }

      setIsRefining(true);
      setErrorMessage(null);

      try {
        const response = await refineSummaryWithAi(trimmed);

        if (!response.success || !response.data) {
          setErrorMessage(
            response.error || "Failed to refine summary. Please try again."
          );
          setIsRefining(false);
          return false;
        }

        setReviewData(response.data);
        setIsReviewOpen(true);
        setIsRefining(false);
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setErrorMessage(message);
        setIsRefining(false);
        return false;
      }
    },
    [isRefining]
  );

  const applyNewSummary = useCallback(
    (onApply: (newSummary: string) => void) => {
      if (reviewData?.newSummary) {
        onApply(reviewData.newSummary);
      }
      setIsReviewOpen(false);
      setReviewData(null);
    },
    [reviewData]
  );

  const skipRefinement = useCallback(() => {
    setIsReviewOpen(false);
    setReviewData(null);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    isRefining,
    isReviewOpen,
    errorMessage,
    reviewData,
    refineSummary,
    applyNewSummary,
    skipRefinement,
    clearError,
  };
}

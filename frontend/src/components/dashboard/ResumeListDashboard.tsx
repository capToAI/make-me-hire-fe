"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { fetchUserResumes, deleteResumeRecord } from "@/lib/api";
import type { ResumeListItem } from "@/lib/types";
import { ResumeCard } from "./ResumeCard";
import { CreateResumeModal } from "./CreateResumeModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface ResumeListDashboardProps {
  onOpenCreateBlank?: () => void;
  onOpenImport?: () => void;
}

export function ResumeListDashboard({
  onOpenCreateBlank,
  onOpenImport,
}: ResumeListDashboardProps) {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<"blank" | "import">("blank");
  const [resumeToDelete, setResumeToDelete] = useState<ResumeListItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadResumes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchUserResumes();
      if (res.success && res.data) {
        setResumes(res.data);
      } else {
        setError(res.error || "Unable to load resumes.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load resumes";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleOpenCreateModal = (mode: "blank" | "import" = "blank") => {
    setCreateModalMode(mode);
    setIsCreateModalOpen(true);
  };

  const handleDeletePrompt = (resume: ResumeListItem) => {
    setResumeToDelete(resume);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (resumeId: string) => {
    const res = await deleteResumeRecord(resumeId);
    if (!res.success) {
      throw new Error(res.error || "Could not delete resume");
    }
    // Remove from local state immediately
    setResumes((prev) => prev.filter((r) => r.id !== resumeId));
  };

  const filteredResumes = resumes.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.position && r.position.toLowerCase().includes(q))
    );
  });

  return (
    <section className="w-full max-w-6xl mx-auto my-6 sm:my-8 px-4 sm:px-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                My Resumes
              </h2>
              {!isLoading && (
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-extrabold text-indigo-700">
                  {resumes.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Manage, edit, or create targeted resumes for your job applications
            </p>
          </div>
        </div>

        {/* Right side: Search & Create Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {resumes.length > 0 && (
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resumes or roles…"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => handleOpenCreateModal("blank")}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Resume</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-rose-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadResumes}
            className="inline-flex items-center gap-1 font-bold text-rose-700 hover:text-rose-900 underline"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-48 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs animate-pulse flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between mb-4">
                  <div className="h-5 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-12 rounded bg-slate-100" />
                </div>
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
              <div className="h-9 w-full rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4 shadow-xs">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            No Resumes Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            You haven’t created any resumes yet. Start building an ATS-compliant resume from scratch or import your existing PDF.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenCreateModal("blank")}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Resume</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenCreateModal("import")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              <span>Import from PDF</span>
            </button>
          </div>
        </div>
      ) : filteredResumes.length === 0 ? (
        /* No Search Match */
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No resumes matched &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        /* Resumes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDeleteClick={handleDeletePrompt}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateResumeModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          loadResumes();
        }}
        initialMode={createModalMode}
      />

      <DeleteConfirmationModal
        resume={resumeToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setResumeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}

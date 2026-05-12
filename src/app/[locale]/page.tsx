'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, PlusCircle, Key, ArrowRight, Copy, Check, X } from 'lucide-react';
import { ExerciseCard } from "./teachers/[accessCode]/exercises/ExerciseCard";
import { getApiUrl } from "@/lib/api";
import { ExerciseType } from "@/app/types/exercise";
import { useRouter } from "@/routing";

interface ExerciseSetResponse {
  id: string;
  teacherAccessCode: string;
  teacherName: string;
  title: string;
  type: ExerciseType;
  shareSlug: string;
  createdAt: string;
  questions?: { prompt: string }[];
}

async function getPublicExercises(): Promise<ExerciseSetResponse[]> {
  const res = await fetch(getApiUrl(`/api/exercises/public`), {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch public exercises');
  }
  
  return res.json();
}

export default function Home() {
  const [exercises, setExercises] = useState<ExerciseSetResponse[]>([]);
  const [accessCode, setAccessCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for teacher creation flow
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [createdTeacher, setCreatedTeacher] = useState<{accessCode: string} | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const t = useTranslations("HomePage");
  const router = useRouter();

  useEffect(() => {
    getPublicExercises()
      .then(setExercises)
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch(getApiUrl('/api/teachers'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: teacherName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedTeacher(data);
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    if (createdTeacher) {
      navigator.clipboard.writeText(createdTeacher.accessCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) {
      router.push(`/teachers/${accessCode.trim()}/exercises`);
    }
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Hero Section */}
        <div className="text-center py-8 px-4">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight max-w-xl mx-auto">
            {t("title")}
          </h1>
          <p className="text-base text-slate-500 max-w-lg mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Public Exercises */}
        <div className="mt-4 mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            {t("publicExercises")}
          </h2>
          
          {isLoading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>
              ))}
            </div>
          ) : exercises.length === 0 ? (
            <div className="card p-12 text-center">
               <p className="text-slate-400 text-lg font-medium">{t("noExercises")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isPublic={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 opacity-90 scale-[0.98] origin-top">
          <div className="card p-5 flex flex-col items-start gap-3">
            <div className="bg-indigo-50 p-2.5 rounded-lg">
              <PlusCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-0.5">{t("createWorkspace")}</h2>
              <p className="text-slate-500 text-xs mb-4">{t("createWorkspaceDesc")}</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary w-full sm:w-auto py-2 px-6 text-sm"
            >
              {t("createWorkspace")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="card p-5 flex flex-col items-start gap-3">
            <div className="bg-amber-50 p-2.5 rounded-lg">
              <Key className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-0.5">{t("alreadyHaveCode")}</h2>
              <p className="text-slate-500 text-xs mb-4">{t("enterCode")}</p>
            </div>
            <form onSubmit={handleAccessCodeSubmit} className="w-full flex gap-2">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Access Code"
                className="input-field py-1.5 px-3 text-sm"
              />
              <button type="submit" className="btn-secondary py-1.5 px-4 text-sm whitespace-nowrap">
                {t("submitCode")}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => !createdTeacher && setShowCreateModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {!createdTeacher ? (
              <form onSubmit={handleCreateWorkspace} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">{t("createWorkspace")}</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("enterTeacherName")}
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder={t("teacherNamePlaceholder")}
                    className="input-field"
                    autoFocus
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isCreating || !teacherName.trim()}
                  className="btn-primary w-full py-3"
                >
                  {isCreating ? "..." : t("createWorkspace")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{t("workspaceCreated")}</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  {t("workspaceCreatedDesc")}
                </p>
                
                <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100 group relative">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {t("yourAccessCode")}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-3xl font-mono font-bold text-indigo-600 tracking-wider">
                      {createdTeacher.accessCode}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-200 transition-all"
                      title={t("copyCode")}
                    >
                      {isCopied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  {isCopied && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-green-600 animate-in fade-in slide-in-from-top-1">
                      {t("copied")}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    router.push(`/teachers/${createdTeacher.accessCode}/exercises`);
                    setShowCreateModal(false);
                  }}
                  className="btn-primary w-full py-4 text-lg"
                >
                  {t("goToWorkspace")}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

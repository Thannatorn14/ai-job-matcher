"use client";

import { useState } from "react";
import { Briefcase, Search, Zap } from "lucide-react";
import ResumeUpload from "@/components/ResumeUpload";
import ProfileSummary from "@/components/ProfileSummary";
import JobCard from "@/components/JobCard";
import StatusBar from "@/components/StatusBar";
import { ResumeProfile, MatchedJob, SearchStatus } from "@/lib/types";

export default function Home() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [status, setStatus] = useState<SearchStatus>({
    stage: "idle",
    message: "",
    progress: 0,
  });
  const [filterScore, setFilterScore] = useState(0);

  const handleResumeSubmit = async (text: string, file?: File) => {
    setStatus({ stage: "analyzing", message: "Analyzing your resume with AI...", progress: 15 });
    setProfile(null);
    setJobs([]);

    try {
      // Step 1: Analyze resume
      const formData = new FormData();
      if (file) formData.append("file", file);
      else formData.append("text", text);

      const analyzeRes = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || "Failed to analyze resume");
      }

      const { profile: extractedProfile } = await analyzeRes.json();
      setProfile(extractedProfile);
      setStatus({
        stage: "searching",
        message: `Searching real-time jobs for: ${extractedProfile.jobTitles.slice(0, 2).join(", ")}...`,
        progress: 45,
      });

      // Step 2: Search and match jobs
      const searchRes = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: extractedProfile }),
      });

      if (!searchRes.ok) {
        const err = await searchRes.json();
        throw new Error(err.error || "Failed to search jobs");
      }

      setStatus({ stage: "matching", message: "AI is scoring job matches...", progress: 85 });

      const { jobs: matchedJobs, message } = await searchRes.json();
      setJobs(matchedJobs || []);
      setStatus({
        stage: "done",
        message:
          message ||
          `Found ${matchedJobs?.length || 0} matching jobs, ranked by AI compatibility.`,
        progress: 100,
      });
    } catch (err) {
      setStatus({
        stage: "error",
        message:
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        progress: 0,
      });
    }
  };

  const filteredJobs = jobs.filter((j) => j.matchScore >= filterScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-none">AI Job Matcher</h1>
              <p className="text-xs text-gray-500">Powered by Claude</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            Real-time job search
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        {status.stage === "idle" && (
          <div className="text-center mb-2">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Find Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Perfect Job
              </span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Upload your resume and let AI search across the internet to find jobs that match
              your skills and experience — ranked by compatibility.
            </p>
          </div>
        )}

        {/* How it works */}
        {status.stage === "idle" && (
          <div className="grid grid-cols-3 gap-4 mb-2">
            {[
              { icon: "📄", title: "Upload Resume", desc: "PDF or paste your resume text" },
              {
                icon: "🔍",
                title: "AI Searches",
                desc: "Queries multiple job platforms in real-time",
              },
              {
                icon: "🎯",
                title: "Ranked Results",
                desc: "Jobs scored by how well they match you",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="bg-white rounded-xl p-4 text-center border border-gray-100"
              >
                <div className="text-2xl mb-2">{step.icon}</div>
                <p className="font-medium text-gray-800 text-sm">{step.title}</p>
                <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Resume Upload */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            {profile ? "Update Your Resume" : "Upload Your Resume"}
          </h2>
          <ResumeUpload
            onSubmit={handleResumeSubmit}
            isLoading={
              status.stage === "analyzing" ||
              status.stage === "searching" ||
              status.stage === "matching"
            }
          />
        </div>

        {/* Status Bar */}
        {status.stage !== "idle" && <StatusBar status={status} />}

        {/* Profile Summary */}
        {profile && <ProfileSummary profile={profile} />}

        {/* Results */}
        {jobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredJobs.length} Jobs Found
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Min match:</span>
                <select
                  value={filterScore}
                  onChange={(e) => setFilterScore(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value={0}>All</option>
                  <option value={40}>40%+</option>
                  <option value={60}>60%+</option>
                  <option value={80}>80%+</option>
                </select>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400">No jobs match the selected filter.</p>
                <button
                  onClick={() => setFilterScore(0)}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredJobs.map((job, i) => (
                  <JobCard key={job.id} job={job} rank={i + 1} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state after search with no results */}
        {status.stage === "done" && jobs.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-700 mb-2">No jobs found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              This usually means the job search API keys are not configured. Check the{" "}
              <code className="bg-gray-100 px-1 rounded">.env.local</code> file and add your
              Adzuna or RapidAPI keys.
            </p>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        Built with Claude AI · Real-time job data from Adzuna &amp; JSearch
      </footer>
    </div>
  );
}

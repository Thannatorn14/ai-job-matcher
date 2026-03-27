"use client";

import { useState } from "react";
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { MatchedJob } from "@/lib/types";

interface JobCardProps {
  job: MatchedJob;
  rank: number;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-100 text-green-700 border-green-200"
      : score >= 60
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : score >= 40
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";

  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Low";

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${color}`}>
      <span className="text-base font-bold">{score}%</span>
      <span className="font-normal opacity-80">{label} match</span>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 60
      ? "bg-blue-500"
      : score >= 40
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export default function JobCard({ job, rank }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);

  const postedDate = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {rank}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.company}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                )}
                {job.salary && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salary}
                  </span>
                )}
                {postedDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {postedDate}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ScoreBadge score={job.matchScore} />
        </div>

        {/* Score Bar */}
        <div className="mt-3">
          <ScoreBar score={job.matchScore} />
        </div>

        {/* Match reason */}
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{job.matchReason}</p>

        {/* Skills Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.matchingSkills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full"
            >
              <CheckCircle2 className="w-3 h-3" /> {skill}
            </span>
          ))}
          {job.missingSkills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full"
            >
              <XCircle className="w-3 h-3" /> {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable Description */}
      {job.description && (
        <>
          <div className="px-5 pb-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Hide description
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Show description
                </>
              )}
            </button>
          </div>
          {expanded && (
            <div className="px-5 pb-4">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {job.description.slice(0, 800)}
                {job.description.length > 800 ? "..." : ""}
              </p>
            </div>
          )}
        </>
      )}

      {/* Card Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">via {job.source}</span>
        {job.applyUrl && (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Apply Now <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

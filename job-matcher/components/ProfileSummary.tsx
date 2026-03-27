"use client";

import { ResumeProfile } from "@/lib/types";
import { User, Briefcase, GraduationCap, Code2, Building2 } from "lucide-react";

interface ProfileSummaryProps {
  profile: ResumeProfile;
}

const levelColors = {
  entry: "bg-green-100 text-green-700",
  mid: "bg-blue-100 text-blue-700",
  senior: "bg-purple-100 text-purple-700",
  executive: "bg-orange-100 text-orange-700",
};

export default function ProfileSummary({ profile }: ProfileSummaryProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <User className="w-4 h-4 text-blue-600" />
        Resume Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-3">
          {profile.name && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
              <p className="text-sm font-medium text-gray-900">{profile.name}</p>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Experience</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[profile.experienceLevel]}`}
                >
                  {profile.experienceLevel.charAt(0).toUpperCase() +
                    profile.experienceLevel.slice(1)}-level
                </span>
                <span className="text-sm text-gray-600">
                  {profile.yearsOfExperience} yr{profile.yearsOfExperience !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {profile.education.length > 0 && (
            <div className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Education</p>
                <p className="text-sm text-gray-700 mt-0.5">
                  {profile.education.slice(0, 2).join(", ")}
                </p>
              </div>
            </div>
          )}

          {profile.industries.length > 0 && (
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Industries</p>
                <p className="text-sm text-gray-700 mt-0.5">
                  {profile.industries.join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column - skills */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Code2 className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500 uppercase tracking-wide">Top Skills</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 12).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-blue-100">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Summary</p>
        <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
      </div>
    </div>
  );
}

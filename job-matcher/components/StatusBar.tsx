"use client";

import { SearchStatus } from "@/lib/types";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface StatusBarProps {
  status: SearchStatus;
}

export default function StatusBar({ status }: StatusBarProps) {
  if (status.stage === "idle") return null;

  const isError = status.stage === "error";
  const isDone = status.stage === "done";

  return (
    <div
      className={`rounded-xl p-4 flex items-center gap-3 ${
        isError
          ? "bg-red-50 border border-red-200"
          : isDone
          ? "bg-green-50 border border-green-200"
          : "bg-blue-50 border border-blue-200"
      }`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
      ) : isDone ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
      ) : (
        <span className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isError ? "text-red-700" : isDone ? "text-green-700" : "text-blue-700"
          }`}
        >
          {status.message}
        </p>
        {!isError && !isDone && (
          <div className="mt-1.5 w-full bg-blue-100 rounded-full h-1.5">
            <div
              className="h-1.5 bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        )}
      </div>

      <span
        className={`text-xs font-medium ${
          isError ? "text-red-500" : isDone ? "text-green-600" : "text-blue-600"
        }`}
      >
        {status.progress}%
      </span>
    </div>
  );
}

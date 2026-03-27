"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, Sparkles } from "lucide-react";

interface ResumeUploadProps {
  onSubmit: (text: string, file?: File) => void;
  isLoading: boolean;
}

export default function ResumeUpload({ onSubmit, isLoading }: ResumeUploadProps) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [resumeText, setResumeText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setSelectedFile(file);
      setMode("upload");
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target?.result as string);
        setMode("paste");
      };
      reader.readAsText(file);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSubmit = () => {
    if (mode === "upload" && selectedFile) {
      onSubmit("", selectedFile);
    } else if (mode === "paste" && resumeText.trim()) {
      onSubmit(resumeText);
    }
  };

  const canSubmit =
    !isLoading &&
    ((mode === "upload" && selectedFile !== null) ||
      (mode === "paste" && resumeText.trim().length > 50));

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode Tabs */}
      <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
        <button
          onClick={() => setMode("upload")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === "upload"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload PDF
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === "paste"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      {/* Upload Area */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : selectedFile
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {selectedFile ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">
                  Drop your resume here, or click to browse
                </p>
                <p className="text-sm text-gray-400 mt-1">PDF or TXT files supported</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste Area */}
      {mode === "paste" && (
        <div className="relative">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here...

Include your:
• Work experience (job titles, companies, dates)
• Skills (technical and soft skills)
• Education
• Achievements and certifications"
            className="w-full h-72 p-4 border-2 border-gray-200 rounded-2xl resize-none text-sm text-gray-700 focus:outline-none focus:border-blue-400 transition-colors placeholder:text-gray-400"
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {resumeText.length} chars
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Find Matching Jobs
          </>
        )}
      </button>
    </div>
  );
}

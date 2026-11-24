"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, ShieldCheck } from "lucide-react";
import { Button } from "./Button";
import { useLanguage } from "@/lib/LanguageContext";

export interface UploadedDoc {
  id?: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  fileUrl: string;
}

export interface FileUploadProps {
  onFileUpload: (doc: UploadedDoc) => void;
  onFileRemove?: (checksum: string) => void;
  uploadedFiles?: UploadedDoc[];
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onFileRemove,
  uploadedFiles = [],
  maxSizeMB = 25,
  allowedTypes = [".pdf", ".docx", ".zip", ".png", ".jpg", ".txt"],
}) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`${t("fileUploadSizeError")} (${maxSizeMB} ${t("fileUploadMB")}).`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(50);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(85);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Upload failed");
      }

      const data: UploadedDoc = await response.json();
      setUploadProgress(100);
      onFileUpload(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload file. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded cursor-pointer transition-colors ${
          isDragging
            ? "border-indigo-500 bg-blue-50/50"
            : "border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-slate-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept={allowedTypes.join(",")}
        />

        <div className="p-3 bg-blue-50 text-indigo-600 rounded-full mb-2.5">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm font-semibold text-slate-800 text-center">
          {t("fileUploadClick")}
        </p>
        <p className="text-xs text-slate-500 text-center mt-1">
          {t("fileUploadSupports")} {allowedTypes.join(", ")} ({t("fileUploadUpTo")} {maxSizeMB} {t("fileUploadMB")})
        </p>

        {isUploading && (
          <div className="w-full max-w-xs mt-4 space-y-1">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>{t("fileUploadProgress")}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Explanatory note */}
      <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <span>{t("fileUploadIntegrityNote")}</span>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {t("fileUploadAttachedDocs")} ({uploadedFiles.length})
          </p>
          <div className="space-y-2">
            {uploadedFiles.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded border border-slate-200 bg-white text-xs shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-slate-800 truncate">{doc.originalName}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{(doc.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {t("fileChecksumVerified")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-indigo-600 hover:underline px-2 py-1"
                  >
                    {t("fileUploadView")}
                  </a>
                  {onFileRemove && (
                    <button
                      type="button"
                      onClick={() => onFileRemove(doc.checksumSha256)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                      title={t("remove")}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

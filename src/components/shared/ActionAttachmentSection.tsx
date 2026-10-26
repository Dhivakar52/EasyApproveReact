import React, { useRef, useState } from "react";
import {
  UploadCloud,
  X,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon,
} from "lucide-react";
import type { SupportingDocument } from "@/dataTypes/nomination";
import { toast } from "@/components/ui/sonner";

export interface ActionAttachmentSectionProps {
  files: SupportingDocument[];
  onChange: (files: SupportingDocument[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

const ALLOWED_EXTENSIONS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
];

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") {
    return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />;
  }
  if (["png", "jpg", "jpeg"].includes(ext)) {
    return <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" />;
  }
  if (["doc", "docx", "txt"].includes(ext)) {
    return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
  }
  return <FileIcon className="w-4 h-4 text-slate-500 shrink-0" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ActionAttachmentSection: React.FC<ActionAttachmentSectionProps> = ({
  files,
  onChange,
  maxFiles = 4,
  maxSizeMB = 10,
  label = "Supporting Document Attachment",
  helperText = "Optional · PDF, Word, Excel, CSV, Text or Images up to 10 MB each",
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndAddFiles = (selectedFiles: FileList | File[]) => {
    if (disabled) return;
    const fileArray = Array.from(selectedFiles);
    if (!fileArray.length) return;

    if (files.length + fileArray.length > maxFiles) {
      toast.error(
        `You can upload a maximum of ${maxFiles} attachments per modal. Current: ${files.length}.`
      );
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const validFilesToRead: File[] = [];

    for (const file of fileArray) {
      // 1. Check duplicate
      const isDuplicate = files.some(
        (f) => f.name.toLowerCase() === file.name.toLowerCase() && f.size === file.size
      );
      if (isDuplicate) {
        toast.info(`"${file.name}" is already attached.`);
        continue;
      }

      // 2. Check empty file
      if (file.size === 0) {
        toast.error(`"${file.name}" is empty (0 bytes) and cannot be attached.`);
        continue;
      }

      // 3. Check size
      if (file.size > maxSizeBytes) {
        toast.error(
          `"${file.name}" exceeds the maximum allowed size of ${maxSizeMB} MB (${formatFileSize(
            file.size
          )}).`
        );
        continue;
      }

      // 4. Check extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(
          `Invalid file format for "${file.name}". Supported formats: PDF, Word, Excel, CSV, Text, and Images (PNG, JPG).`
        );
        continue;
      }

      validFilesToRead.push(file);
    }

    if (!validFilesToRead.length) return;

    let processedCount = 0;
    const newDocs: SupportingDocument[] = [];

    validFilesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newDocs.push({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          uploadedAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          dataUrl: typeof reader.result === "string" ? reader.result : undefined,
        });

        processedCount += 1;
        if (processedCount === validFilesToRead.length) {
          onChange([...files, ...newDocs]);
          toast.success(
            `Added ${newDocs.length} attachment${newDocs.length > 1 ? "s" : ""}.`
          );
        }
      };

      reader.onerror = () => {
        toast.error(`Failed to read file "${file.name}".`);
        processedCount += 1;
        if (processedCount === validFilesToRead.length && newDocs.length > 0) {
          onChange([...files, ...newDocs]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (fileId?: string, fileName?: string) => {
    if (disabled) return;
    const filtered = files.filter(
      (f) => (fileId ? f.id !== fileId : f.name !== fileName)
    );
    onChange(filtered);
  };

  const isLimitReached = files.length >= maxFiles;

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-medium ${
            isLimitReached
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {files.length}/{maxFiles} files
        </span>
      </div>

      {!isLimitReached && !disabled && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) {
              validateAndAddFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`p-3.5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition select-none ${
            isDragging
              ? "border-blue-500 bg-blue-50/50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-slate-50/40"
          }`}
        >
          <div className="flex items-center gap-2 text-slate-600">
            <UploadCloud className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-xs font-semibold">
              Click to browse or drag &amp; drop files
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              if (e.target.files) {
                validateAndAddFiles(e.target.files);
              }
              e.target.value = "";
            }}
          />
        </div>
      )}

      {files.length > 0 && (
        <div className="grid gap-1.5 pt-1">
          {files.map((file, idx) => (
            <div
              key={file.id || `${file.name}-${idx}`}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 flex items-center justify-between text-xs transition shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {getFileIcon(file.name)}
                <span
                  className="font-medium text-slate-800 truncate"
                  title={file.name}
                >
                  {file.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(file.id, file.name)}
                  className="w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer shrink-0"
                  title="Remove document"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionAttachmentSection;

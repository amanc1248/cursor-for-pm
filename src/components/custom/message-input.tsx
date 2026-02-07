"use client";

import { useCallback, useRef, useState } from "react";
import {
  useTamboThreadInput,
  useTamboSuggestions,
  useTamboContextAttachment,
} from "@tambo-ai/react";
import { Send, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { setFeedback } from "@/lib/feedback-store";
import {
  classifyFile,
  parseFile,
  ACCEPTED_FILE_TYPES,
  type ParsedFile,
} from "@/lib/file-parser";

interface StagedFile {
  id: string;
  name: string;
  type: "pdf" | "text" | "image";
  preview: string; // short preview of content or "Image"
}

export function MessageInput() {
  const { value, setValue, submit, isPending, error, addImage, addImages, images, removeImage } =
    useTamboThreadInput();
  const { suggestions, accept, isPending: suggestionsPending } =
    useTamboSuggestions({ maxSuggestions: 4 });
  const { addContextAttachment, clearContextAttachments } =
    useTamboContextAttachment();

  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setParseError(null);
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        const fileType = classifyFile(file);

        if (fileType === "image") {
          await addImage(file);
          setStagedFiles((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${file.name}`,
              name: file.name,
              type: "image",
              preview: "Image attached",
            },
          ]);
          continue;
        }

        if (fileType === "unsupported") {
          setParseError(
            `Unsupported file type: ${file.name}. Use PDF, CSV, TXT, MD, JSON, or images.`
          );
          continue;
        }

        try {
          const parsed: ParsedFile = await parseFile(file);
          if (!parsed.content) {
            setParseError(`Could not extract text from ${file.name}`);
            continue;
          }

          // Store as feedback if it looks like feedback data
          setFeedback(parsed.content);

          // Add as context attachment so the AI sees it with the next message
          const displayName = parsed.pageCount
            ? `${file.name} (${parsed.pageCount} pages)`
            : file.name;

          addContextAttachment({
            context: parsed.content,
            displayName,
            type: "file",
          });

          setStagedFiles((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${file.name}`,
              name: file.name,
              type: fileType as "pdf" | "text",
              preview:
                parsed.content.slice(0, 80).replace(/\n/g, " ") + "...",
            },
          ]);
        } catch (err) {
          setParseError(
            `Failed to parse ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`
          );
        }
      }
    },
    [addImage, addContextAttachment]
  );

  const removeStagedFile = useCallback(
    (id: string) => {
      setStagedFiles((prev) => prev.filter((f) => f.id !== id));
      // If it was an image, remove from Tambo's image list too
      const file = stagedFiles.find((f) => f.id === id);
      if (file?.type === "image") {
        const tamboImage = images.find((img) => img.name === file.name);
        if (tamboImage) removeImage(tamboImage.id);
      }
    },
    [stagedFiles, images, removeImage]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!value.trim() && stagedFiles.length === 0 && images.length === 0) || isPending)
      return;

    // If there are staged text/pdf files and no explicit message, auto-prompt
    if (!value.trim() && stagedFiles.some((f) => f.type !== "image")) {
      setValue("I've uploaded customer feedback. Please analyze it and identify the key themes.");
    }

    await submit({ streamResponse: true });

    // Clear staged files after submit (context attachments auto-clear)
    setStagedFiles([]);
    setParseError(null);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        await processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        await processFiles(e.target.files);
        // Reset input so the same file can be selected again
        e.target.value = "";
      }
    },
    [processFiles]
  );

  return (
    <div
      className="border-t border-slate-800"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Suggestions */}
      {suggestions.length > 0 && !suggestionsPending && (
        <div className="px-4 pt-3">
          <div className="text-gray-500 text-xs mb-2">Suggested actions</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => accept({ suggestion, shouldSubmit: true })}
                disabled={isPending}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-blue-500/50 transition-all disabled:opacity-50"
              >
                {suggestion.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="mx-4 mt-3 p-6 border-2 border-dashed border-blue-500/50 rounded-xl bg-blue-500/10 text-center">
          <p className="text-blue-400 text-sm font-medium">
            Drop files here — PDF, CSV, TXT, or images
          </p>
        </div>
      )}

      {/* Staged files preview */}
      {stagedFiles.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {stagedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs"
            >
              {file.type === "image" ? (
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span className="text-gray-300 max-w-[150px] truncate">
                {file.name}
              </span>
              <button
                onClick={() => removeStagedFile(file.id)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Staged images from Tambo (shown if added via paste) */}
      {images.length > 0 && stagedFiles.every((f) => f.type !== "image") && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.dataUrl}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-gray-300 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask about feedback, features, or priorities..."
            disabled={isPending}
            rows={3}
            className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700 placeholder-gray-500 transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            onPaste={async (e) => {
              // Handle pasted images
              const items = Array.from(e.clipboardData.items);
              const imageItems = items.filter((item) =>
                item.type.startsWith("image/")
              );
              if (imageItems.length > 0) {
                e.preventDefault();
                const imageFiles = imageItems
                  .map((item) => item.getAsFile())
                  .filter((f): f is File => f !== null);
                await addImages(imageFiles);
              }
            }}
          />

          {/* Action buttons */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              title="Attach files (PDF, CSV, TXT, images)"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={
                isPending ||
                (!value.trim() && stagedFiles.length === 0 && images.length === 0)
              }
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error messages */}
        {(error || parseError) && (
          <div className="mt-2 text-sm text-red-400">
            {error?.message ?? parseError}
          </div>
        )}
      </div>
    </div>
  );
}

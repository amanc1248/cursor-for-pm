"use client";

import { useCallback, useRef, useState } from "react";
import {
  useTamboThreadInput,
  useTamboSuggestions,
  useTamboContextAttachment,
} from "@tambo-ai/react";
import {
  ArrowUp,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
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
  preview: string;
}

export function MessageInput() {
  const {
    value,
    setValue,
    submit,
    isPending,
    error,
    addImage,
    addImages,
    images,
    removeImage,
  } = useTamboThreadInput();
  const { suggestions, accept, isPending: suggestionsPending } =
    useTamboSuggestions({ maxSuggestions: 4 });
  const { addContextAttachment } = useTamboContextAttachment();

  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

          setFeedback(parsed.content);

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
      const file = stagedFiles.find((f) => f.id === id);
      if (file?.type === "image") {
        const tamboImage = images.find((img) => img.name === file.name);
        if (tamboImage) removeImage(tamboImage.id);
      }
    },
    [stagedFiles, images, removeImage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (!value.trim() && stagedFiles.length === 0 && images.length === 0) ||
      isPending
    )
      return;

    // If staged text files and no message, auto-prompt
    if (!value.trim() && stagedFiles.some((f) => f.type !== "image")) {
      setValue(
        "I've uploaded customer feedback. Please analyze it and identify the key themes."
      );
    }

    // Fire submit first so it captures the current value
    void submit({ streamResponse: true });

    // Clear after submit has captured the value
    requestAnimationFrame(() => {
      setValue("");
      setStagedFiles([]);
      setParseError(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  // Drag and drop
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
        e.target.value = "";
      }
    },
    [processFiles]
  );

  const canSend =
    !isPending &&
    (value.trim() || stagedFiles.length > 0 || images.length > 0);

  return (
    <div
      className="border-t border-white/[0.06]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Suggestions */}
      {suggestions.length > 0 && !suggestionsPending && (
        <div className="px-5 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => accept({ suggestion, shouldSubmit: true })}
                disabled={isPending}
                className="text-[12px] px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white/80 hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200 disabled:opacity-40"
              >
                {suggestion.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="mx-5 mt-3 p-6 border-2 border-dashed border-indigo-500/40 rounded-2xl bg-indigo-500/[0.05] text-center">
          <p className="text-indigo-400/80 text-sm font-medium">
            Drop files here
          </p>
        </div>
      )}

      {/* Staged files */}
      {stagedFiles.length > 0 && (
        <div className="px-5 pt-3 flex flex-wrap gap-1.5">
          {stagedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-[11px]"
            >
              {file.type === "image" ? (
                <ImageIcon className="w-3 h-3 text-violet-400/70" />
              ) : (
                <FileText className="w-3 h-3 text-indigo-400/70" />
              )}
              <span className="text-white/50 max-w-[120px] truncate">
                {file.name}
              </span>
              <button
                onClick={() => removeStagedFile(file.id)}
                className="text-white/20 hover:text-white/50 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Staged images from paste */}
      {images.length > 0 && stagedFiles.every((f) => f.type !== "image") && (
        <div className="px-5 pt-3 flex flex-wrap gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/[0.06]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.dataUrl}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 text-white/60 hover:text-white"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-3 py-2 focus-within:border-white/[0.15] transition-colors duration-200"
        >
          {/* Attach */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-white/40 hover:text-white/70 hover:bg-white/[0.06] rounded-xl transition-all duration-200 flex-shrink-0 mb-0.5"
            title="Attach files (PDF, CSV, TXT, images)"
          >
            <Paperclip className="w-[18px] h-[18px]" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-transparent text-white/90 text-[13.5px] resize-none focus:outline-none placeholder:text-white/25 placeholder:italic leading-relaxed py-1.5 max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            onPaste={async (e) => {
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

          {/* Send */}
          <button
            type="submit"
            disabled={!canSend}
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 mb-0.5 ${
              canSend
                ? "bg-white text-black hover:bg-white/90 shadow-sm"
                : "bg-white/[0.06] text-white/20"
            }`}
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
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

        {/* Errors */}
        {(error || parseError) && (
          <div className="mt-2 text-[12px] text-red-400/80">
            {error?.message ?? parseError}
          </div>
        )}
      </div>
    </div>
  );
}

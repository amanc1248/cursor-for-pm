"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, X, Loader2, FileText } from "lucide-react";
import { getProductDoc, setProductDoc } from "@/lib/product-doc-store";

interface ServiceStatus {
  connected: boolean;
  siteName?: string;
  teamName?: string;
  email?: string;
  username?: string;
  mode?: string;
}

interface ConnectionStatus {
  jira: ServiceStatus;
  slack: ServiceStatus;
  google: ServiceStatus;
  github: ServiceStatus;
}

const services = [
  {
    key: "jira" as const,
    name: "Jira",
    description: "Create tickets, search issues, track sprints",
    connectUrl: "/api/auth/jira",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84H11.53zM6.77 6.8a4.36 4.36 0 0 0 4.34 4.34h1.8v1.72a4.36 4.36 0 0 0 4.34 4.34V7.63a.84.84 0 0 0-.83-.83H6.77zM2 11.6a4.35 4.35 0 0 0 4.34 4.34h1.8v1.72A4.35 4.35 0 0 0 12.48 22v-9.57a.84.84 0 0 0-.84-.84H2z" />
      </svg>
    ),
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
  },
  {
    key: "slack" as const,
    name: "Slack",
    description: "Post messages, share updates with your team",
    connectUrl: "/api/auth/slack",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
  },
  {
    key: "google" as const,
    name: "Google Calendar",
    description: "Create events, check availability, manage schedule",
    connectUrl: "/api/auth/google",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2H8v2H4.5a.5.5 0 0 0-.5.5v15a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V8h2v11.5a2.5 2.5 0 0 1-2.5 2.5z" />
        <path d="M16 2h2v4h-2zM6 2h2v4H6zM2 8h20v2H2z" />
        <circle cx="8" cy="14" r="1.5" />
        <circle cx="12" cy="14" r="1.5" />
        <circle cx="16" cy="14" r="1.5" />
        <circle cx="8" cy="18" r="1.5" />
        <circle cx="12" cy="18" r="1.5" />
      </svg>
    ),
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-400",
  },
  {
    key: "github" as const,
    name: "GitHub",
    description: "Analyze code dependencies and data impact for features",
    connectUrl: "/api/auth/github",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    color: "from-gray-600 to-gray-800",
    bgColor: "bg-gray-500/10",
    textColor: "text-gray-300",
  },
];

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [productDoc, setProductDocState] = useState("");
  const [docSaved, setDocSaved] = useState(false);

  useEffect(() => {
    setProductDocState(getProductDoc() ?? "");
  }, []);

  const handleSaveDoc = () => {
    setProductDoc(productDoc);
    setDocSaved(true);
    setToast("Product documentation saved!");
    setTimeout(() => { setToast(null); setDocSaved(false); }, 3000);
  };

  const fetchStatus = async () => {
    try {
      const resp = await fetch("/api/auth/status");
      const data = await resp.json();
      setStatus(data);
    } catch {
      console.error("Failed to fetch connection status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected) {
      setToast(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`);
      setTimeout(() => setToast(null), 4000);
      // Refresh status
      fetchStatus();
    }
    const error = searchParams.get("error");
    if (error) {
      setToast(`Connection failed: ${error.replace(/_/g, " ")}`);
      setTimeout(() => setToast(null), 4000);
    }
  }, [searchParams]);

  const handleDisconnect = async (service: string) => {
    setDisconnecting(service);
    try {
      await fetch("/api/auth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      });
      await fetchStatus();
      setToast(`${service.charAt(0).toUpperCase() + service.slice(1)} disconnected`);
      setTimeout(() => setToast(null), 3000);
    } catch {
      console.error("Failed to disconnect");
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-up">
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-[13px] text-white/80">{toast}</span>
            <button
              onClick={() => setToast(null)}
              className="text-white/30 hover:text-white/60 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-[13px] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to chat
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-2">
            Integrations
          </h1>
          <p className="text-white/40 text-[14px] leading-relaxed">
            Connect your tools to let PMcrush work with your accounts.
            Your credentials are encrypted and stored securely.
          </p>
        </div>

        {/* Service cards */}
        <div className="space-y-4">
          {services.map((service) => {
            const svc = status?.[service.key];
            const isConnected = svc?.connected ?? false;
            const isDisconnecting = disconnecting === service.key;

            const info =
              service.key === "jira"
                ? svc?.siteName
                : service.key === "slack"
                  ? svc?.teamName
                  : service.key === "github"
                    ? svc?.username
                    : svc?.email;

            return (
              <div
                key={service.key}
                className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl ${service.bgColor} ${service.textColor} flex items-center justify-center`}
                    >
                      {service.icon}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                          {service.name}
                        </h3>
                        {isConnected && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-white/35 text-[13px]">
                        {service.description}
                      </p>
                      {isConnected && info && (
                        <p className="text-white/25 text-[12px] mt-1 font-mono">
                          {info}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
                      </div>
                    ) : isConnected ? (
                      <button
                        onClick={() => handleDisconnect(service.key)}
                        disabled={isDisconnecting}
                        className="text-[12px] text-white/30 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50"
                      >
                        {isDisconnecting ? "..." : "Disconnect"}
                      </button>
                    ) : (
                      <a
                        href={service.connectUrl}
                        className={`inline-flex items-center gap-1.5 text-[13px] font-medium bg-gradient-to-r ${service.color} text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-lg`}
                      >
                        Connect
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Product Documentation */}
        <div className="mt-10 mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-[17px] font-semibold tracking-[-0.01em]">
              Product Documentation
            </h2>
          </div>
          <p className="text-white/40 text-[13px] leading-relaxed mb-4">
            Paste your product docs, PRDs, or any context here. The AI will use
            this as background knowledge when answering questions, suggesting
            features, or analyzing dependencies.
          </p>
          <div className="relative">
            <textarea
              value={productDoc}
              onChange={(e) => { setProductDocState(e.target.value); setDocSaved(false); }}
              placeholder="e.g. Product overview, architecture, key features, user personas, tech stack, API docs..."
              className="w-full h-48 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-[13px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 transition-colors resize-y font-mono leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-white/20 text-[11px]">
                {productDoc.length > 0
                  ? `${productDoc.length.toLocaleString()} chars · ${productDoc.split("\n").length} lines`
                  : "No documentation added yet"}
              </span>
              <button
                onClick={handleSaveDoc}
                disabled={docSaved}
                className={`text-[13px] font-medium px-4 py-1.5 rounded-lg transition-all ${
                  docSaved
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                }`}
              >
                {docSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Continue to chat */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/chat"
            className="text-white/30 hover:text-white/60 text-[13px] transition-colors"
          >
            Skip for now
          </Link>
          <Link
            href="/chat"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-2.5 rounded-xl text-[14px] transition-all shadow-lg shadow-indigo-500/25"
          >
            Continue to Chat
          </Link>
        </div>

        {/* Footer note */}
        <div className="mt-8 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
          <p className="text-white/25 text-[12px] leading-relaxed">
            Credentials are encrypted with AES-256-GCM and stored in HTTP-only
            cookies. They are never sent to third parties beyond the respective
            service APIs. You can disconnect at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

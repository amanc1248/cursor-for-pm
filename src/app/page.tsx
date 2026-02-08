import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-xs">PM</span>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-[-0.01em]">
            PM Assistant
          </span>
        </div>
        <Link
          href="/chat"
          className="text-white/40 hover:text-white/70 text-[13px] transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        {/* Gradient orb */}
        <div className="relative w-28 h-28 mb-10">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 blur-2xl" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500/15 to-violet-500/15 blur-xl" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-white/[0.08] flex items-center justify-center">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] text-center mb-5 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Your AI Product Manager
        </h1>

        <p className="text-white/40 text-[16px] leading-relaxed text-center max-w-lg mb-10">
          Analyze feedback, prioritize features, create Jira tickets, draft
          PRDs, and run standups &mdash; all from a single conversation.
        </p>

        {/* CTA */}
        <Link
          href="/settings"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-8 py-3.5 rounded-2xl text-[15px] transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        >
          Get Started
        </Link>

        {/* Feature pills */}
        <div className="flex items-center gap-3 mt-12 flex-wrap justify-center">
          {[
            { label: "Jira", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { label: "Slack", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { label: "Google Calendar", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
          ].map((item) => (
            <span
              key={item.label}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border ${item.color}`}
            >
              {item.label}
            </span>
          ))}
        </div>

        {/* Capabilities grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-2xl">
          {[
            "Feedback Analysis",
            "Feature Prioritization",
            "PRD Generation",
            "Sprint Planning",
            "Competitive Analysis",
            "Status Reports",
            "Meeting Notes",
            "Roadmap Planning",
          ].map((cap) => (
            <div
              key={cap}
              className="text-center px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-white/30 text-[11.5px]"
            >
              {cap}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 text-center">
        <p className="text-white/15 text-[11px]">
          Built with Tambo AI
        </p>
      </footer>
    </div>
  );
}

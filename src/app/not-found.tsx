import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white/80 text-2xl font-semibold mb-2">
          Page not found
        </h1>
        <Link
          href="/chat"
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Go to chat
        </Link>
      </div>
    </div>
  );
}

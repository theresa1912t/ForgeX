import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl border border-[#E4E7EB] p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#FEF3F2] text-[#D92D20] mx-auto flex items-center justify-center font-bold text-lg mb-4">
          404
        </div>
        <h2 className="text-xl font-semibold text-[#18202A] mb-2">
          Page Not Found
        </h2>
        <p className="text-[14px] text-[#5F6875] mb-6">
          The requested manufacturing module or telemetry endpoint could not be found.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-[#2F5BFF] hover:bg-[#2448D8] text-white font-medium text-[14px] transition-colors"
        >
          Return to FactoryLens Dashboard
        </Link>
      </div>
    </div>
  );
}

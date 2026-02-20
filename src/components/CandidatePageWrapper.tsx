import { useState, useEffect } from 'react';
import CandidateProfile from './CandidateProfile';

export default function CandidatePageWrapper() {
  const [filerId, setFilerId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Get the filer ID from URL search params
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      setFilerId(id);
    } else {
      setNotFound(true);
    }
  }, []);

  if (notFound) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500 mb-4">No candidate ID provided. Please go back and select a candidate.</p>
        <a
          href="/search/committees"
          className="inline-block px-4 py-2 bg-[#002868] text-white rounded-lg hover:bg-blue-900"
        >
          Browse Committees
        </a>
      </div>
    );
  }

  if (!filerId) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      </div>
    );
  }

  return <CandidateProfile filerId={filerId} />;
}

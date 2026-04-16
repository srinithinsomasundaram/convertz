"use client";
export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-20 w-20">
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-indigo-400 border-b-transparent animate-spin-reverse opacity-40" />
          
          {/* Center dot */}
          <div className="absolute inset-[34%] rounded-full bg-indigo-600 animate-pulse" />
        </div>
        
        <div className="flex flex-col items-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
            Convert<span className="text-indigo-600">z</span>
          </p>
          <div className="mt-2 flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" />
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}

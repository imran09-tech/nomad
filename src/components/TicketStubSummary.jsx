export default function TicketStubSummary({ children, leftContent, rightContent, className = '' }) {
  return (
    <div className={`flex w-full overflow-hidden shadow-2xl ${className}`}>
      {/* Left Main Section */}
      <div className="flex-1 bg-slate-900/20 backdrop-blur-xl border border-r-0 border-slate-800/40 rounded-l-2xl p-6 relative">
        {leftContent || children}
        {/* Top Right Inverted Corner */}
        <div className="absolute -right-3 -top-3 w-6 h-6 bg-[#020408] rounded-full border border-slate-800/40 z-10" />
        {/* Bottom Right Inverted Corner */}
        <div className="absolute -right-3 -bottom-3 w-6 h-6 bg-[#020408] rounded-full border border-slate-800/40 z-10" />
      </div>

      {/* Dashed Divider Line */}
      <div className="w-[1px] relative bg-slate-900/20 backdrop-blur-xl border-t border-b border-slate-800/40 z-0">
        <div className="absolute inset-y-0 -left-[1px] border-l-2 border-dashed border-slate-800/80 w-[2px]"></div>
      </div>

      {/* Right Stub Section */}
      <div className="w-1/3 min-w-[200px] bg-slate-900/20 backdrop-blur-xl border border-l-0 border-slate-800/40 rounded-r-2xl p-6 flex flex-col justify-center">
        {rightContent}
      </div>
    </div>
  );
}

import type {ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return(
    <div className="flex min-h-screen flex-col bg-[#F5F8FC] text-[#192C45] [color-scheme:light]">
      <header className="shrink-0 border-b border-[#4A79B9] bg-[#124FA7] text-white">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-semibold text-[#124FA7]">
              i
            </span>
            <span className="text-base font-semibold tracking-tight">
              Incident Desk
            </span>
          </div>
          <span aria-hidden="true" className="hidden h-4 w-px bg-[#4A79B9] sm:block"/>
          <span className="hidden text-xs text-[#D4E4FC] sm:block"> Investigation workspace</span>
          <span className="ml-auto rounded border border-white/25 px-2 py-1 text-xs text-[#D4E4FC]">Demo data</span>
        </div>
      </header>
      <main className="w-full flex-1">{children}</main>
    </div>
  )
}

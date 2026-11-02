import type { ReactNode } from "react";

type Props = {
  /** Kode status yang ditampilkan besar, mis. "404". */
  code: string;
  title: string;
  description: string;
  actions: ReactNode;
  /** Halaman penuh (404/403/401/500 di luar layout) atau di dalam konten layout. */
  fullScreen?: boolean;
};

/** Tampilan galat seragam mengikuti tema OmniSUS. Tidak menampilkan detail teknis. */
export function StatusPage({ code, title, description, actions, fullScreen = false }: Props) {
  return (
    <main
      className={`mx-auto flex max-w-md flex-col items-center justify-center gap-4 px-4 text-center ${
        fullScreen ? "min-h-screen" : "py-16"
      }`}
    >
      <p className="font-display text-8xl leading-none text-primary">{code}</p>
      <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <div className="flex flex-wrap justify-center gap-3">{actions}</div>
    </main>
  );
}

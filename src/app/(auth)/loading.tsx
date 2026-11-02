export default function Loading() {
  return (
    <div
      role="progressbar"
      aria-label="Memuat"
      className="mx-auto h-1 w-40 overflow-hidden rounded-full bg-primary/15"
    >
      <div className="h-full origin-left animate-load-fill rounded-full bg-primary motion-reduce:animate-none motion-reduce:scale-x-50" />
    </div>
  );
}

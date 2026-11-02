const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

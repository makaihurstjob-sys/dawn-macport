function csvCell(value: unknown): string {
  let text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  // Keep user-entered formulas inert when opened in spreadsheet applications.
  if (typeof value === "string" && /^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function rowsToCsv(rows: Record<string, unknown>[]): string {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  if (!columns.length) return "";
  return "\uFEFF" + [columns.map(csvCell).join(","), ...rows.map((row) =>
    columns.map((column) => csvCell(row[column])).join(","),
  )].join("\r\n") + "\r\n";
}

export function downloadCsv(rows: Record<string, unknown>[], filename: string): void {
  const csv = rowsToCsv(rows);
  if (!csv) throw new Error("There are no records to export.");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Allow browsers time to start the download before releasing its contents.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

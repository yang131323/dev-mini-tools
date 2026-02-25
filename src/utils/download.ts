export interface DownloadDataUrlOptions {
  fileLink: string;
  fileName: string;
  mimeType?: string;
}

function getFileExtensionFromMimeType(mimeType: string): string | null {
  const parts = mimeType.split("/");
  if (parts.length < 2) return null;

  const subtype = parts[1];
  if (!subtype) return null;

  const normalized = subtype.split(";")[0]?.trim();
  if (!normalized) return null;

  const base = normalized.split("+")[0];
  if (!base) return null;

  if (base === "jpeg") return "jpg";
  return base;
}

export function downloadDataUrl(options: DownloadDataUrlOptions): void {
  const { fileLink, fileName, mimeType } = options;

  const hasExtension = /\.[a-z0-9]+$/i.test(fileName);
  let downloadName = fileName;

  if (!hasExtension && mimeType) {
    const extension = getFileExtensionFromMimeType(mimeType);
    downloadName = `${fileName}.${extension}`;
  }

  const link = document.createElement("a");
  link.download = downloadName;
  link.href = fileLink;
  link.rel = "noopener";

  // document.body.appendChild(link);
  link.click();
  // document.body.removeChild(link);
}

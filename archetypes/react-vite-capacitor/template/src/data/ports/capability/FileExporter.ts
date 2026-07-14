export interface FileExportPayload {
  content: BlobPart;
  contentType: string;
  fileName: string;
}

export interface FileExporter {
  exportFile(payload: FileExportPayload): Promise<void>;
}

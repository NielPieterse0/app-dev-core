import type {
  FileExporter,
  FileExportPayload,
} from "@/data/ports/capability/FileExporter.js";

export class AnchorFileExporter implements FileExporter {
  async exportFile({ content, contentType, fileName }: FileExportPayload) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
  }
}

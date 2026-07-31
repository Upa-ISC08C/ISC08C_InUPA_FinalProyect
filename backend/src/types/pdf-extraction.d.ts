// La librería pdf-extraction no trae tipos propios.
declare module 'pdf-extraction' {
  interface PDFData {
    text: string;
    numpages?: number;
    info?: any;
    metadata?: any;
    version?: string;
  }
  function pdfParse(buffer: Buffer | Uint8Array, options?: any): Promise<PDFData>;
  export default pdfParse;
}

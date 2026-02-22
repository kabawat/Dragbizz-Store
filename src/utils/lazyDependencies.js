export const lazyConfetti = () => {
  if (typeof window === "undefined") return null;
  return import("canvas-confetti").then((mod) => mod.default);
};

export const lazyMoment = () => {
  return import("moment");
};

export const lazyExcelJS = () => {
  return import("exceljs");
};

export const lazyJsPDF = () => {
  return import("jspdf");
};

export const lazyHtml2Canvas = () => {
  if (typeof window === "undefined") return null;
  return import("html2canvas");
};

export const lazyXLSX = () => {
  return import("xlsx");
};

export const useConfetti = async () => {
  const confetti = await lazyConfetti();
  return confetti;
};

export const useMoment = async () => {
  const moment = await lazyMoment();
  return moment.default || moment;
};

export const useExcelJS = async () => {
  const ExcelJS = await lazyExcelJS();
  return ExcelJS.default || ExcelJS;
};

export const useJsPDF = async () => {
  const jsPDF = await lazyJsPDF();
  return jsPDF.default || jsPDF;
};

export const useHtml2Canvas = async () => {
  const html2canvas = await lazyHtml2Canvas();
  return html2canvas.default || html2canvas;
};

export const useXLSX = async () => {
  const XLSX = await lazyXLSX();
  return XLSX.default || XLSX;
};

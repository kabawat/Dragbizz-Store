import ExcelJS from "exceljs";
import createB2BASheet from "./sheets/B2BASheet";
import createB2BSheet from "./sheets/B2BSheet";
import createB2BCDNRSheet from "./sheets/B2BCDNRSheet";
import createISDSheet from "./sheets/ISDSheet";
import createISDASheet from "./sheets/ISDASheet";
import createIMPGSheet from "./sheets/IMPGSheet";
import createIMPGSEZSheet from "./sheets/IMPGSEZSheet";
import createB2BITCReversalSheet from "./sheets/B2BITCReversalSheet";
import createB2BAITCRSheet from "./sheets/B2BAITCReversal";
import createB2BDNRSheet from "./sheets/B2BDNRSheet";
import createB2BDNRASheet from "./sheets/B2BDNRASheet.js";
import createB2BRejectedSheet from "./sheets/B2BRejected.js";
import createB2BARejectedSheet from "./sheets/ B2BARejected.js";
import createB2BCDNRRejectedSheet from "./sheets/B2BCDNRRejectedSheet.js";
import createB2BCDNRARejectedSheet from "./sheets/B2BCDNRARejected.js";
import createECORejectedSheet from "./sheets/ECORejected.js";
import createECOARejectedSheet from "./sheets/ECOARejectedSheet.js";
import createISDRejectedSheet from "./sheets/ISDRejectedSheet.js";
import createISDARejectedSheet from "./sheets/ISDARejectedSheet.js";
import createECOSheet from "./sheets/ECOSheet.js";
import createECOASheet from "./sheets/ECOASheet.js";
import createB2BCDNRASheet from "./sheets/B2BCDNRA.js";
import createITCReversalSheet from "./sheets/ITCReversalSheet.js";
import createITCRejectdSheet from "./sheets/ITCRejected.js";
import createITCNotAvailableSheet from "./sheets/ITCNotAvailableSheet.js";
import createITCAvailableSheet from "./sheets/ITCAvailable.js";
import createReadSheet from "./sheets/ReadMe.js";

const exportGstr2bExcel = async (data, filename = "GSTR-2B_Professional.xlsx") => {
  const workbook = new ExcelJS.Workbook();

  // Metadata for ReadMe sheet
  createReadSheet(workbook, data);

  // Data for actual sheets
  const rows = Array.isArray(data) ? data : (data?.gstr1 || []);

  createITCAvailableSheet(workbook, rows);
  createITCNotAvailableSheet(workbook, rows);
  createITCReversalSheet(workbook, rows);
  createITCRejectdSheet(workbook, rows);
  createB2BSheet(workbook, rows);
  createB2BASheet(workbook, rows);
  createB2BCDNRSheet(workbook, rows);
  createB2BCDNRASheet(workbook, rows);
  createECOSheet(workbook, rows);
  createECOASheet(workbook, rows);
  createISDSheet(workbook, rows);
  createISDASheet(workbook, rows);
  createIMPGSheet(workbook, rows);
  createIMPGSEZSheet(workbook, rows);
  createB2BITCReversalSheet(workbook, rows);
  createB2BAITCRSheet(workbook, rows);
  createB2BDNRSheet(workbook, rows);
  createB2BDNRASheet(workbook, rows);
  createB2BRejectedSheet(workbook, rows);
  createB2BARejectedSheet(workbook, rows);
  createB2BCDNRRejectedSheet(workbook, rows);
  createB2BCDNRARejectedSheet(workbook, rows);
  createECORejectedSheet(workbook, rows);
  createECOARejectedSheet(workbook, rows);
  createISDRejectedSheet(workbook, rows);
  createISDARejectedSheet(workbook, rows);

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default exportGstr2bExcel;

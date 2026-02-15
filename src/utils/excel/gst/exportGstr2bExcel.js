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

  createITCAvailableSheet(workbook, data);
  createITCNotAvailableSheet(workbook, data);
  createITCReversalSheet(workbook, data);
  createITCRejectdSheet(workbook, data);

  // Dynamic Categorized Sheets
  createB2BSheet(workbook, data?.gstr2b || []);
  createB2BASheet(workbook, data?.b2ba || []);
  createB2BCDNRSheet(workbook, data?.cdnr || []);
  createB2BCDNRASheet(workbook, data?.cdnra || []);
  createECOSheet(workbook, data?.eco || []);
  createECOASheet(workbook, data?.ecoa || []);
  createISDSheet(workbook, data?.isd || []);
  createISDASheet(workbook, data?.isda || []);
  createIMPGSheet(workbook, data?.impg || []);
  createIMPGSEZSheet(workbook, data?.impgsez || []);
  createB2BITCReversalSheet(workbook, data?.itcReversal || []);
  createB2BAITCRSheet(workbook, data?.b2baItcr || []);
  createB2BDNRSheet(workbook, data?.cdnr || []);
  createB2BDNRASheet(workbook, data?.cdnra || []);

  // Rejections
  createB2BRejectedSheet(workbook, data?.rejected?.b2b || []);
  createB2BARejectedSheet(workbook, data?.rejected?.b2ba || []);
  createB2BCDNRRejectedSheet(workbook, data?.rejected?.cdnr || []);
  createB2BCDNRARejectedSheet(workbook, data?.rejected?.cdnra || []);
  createECORejectedSheet(workbook, data?.rejected?.eco || []);
  createECOARejectedSheet(workbook, data?.rejected?.ecoa || []);
  createISDRejectedSheet(workbook, data?.rejected?.isd || []);
  createISDARejectedSheet(workbook, data?.rejected?.isda || []);

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

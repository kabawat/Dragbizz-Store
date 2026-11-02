import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class TallyService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG.RETAILER.INTEGRATIONS;
  }

  async getTallyExport(storeId, params = {}) {
    const format = params.format || "xml";
    const url = this.buildUrl(`${this.endpoint}/tally/export`, {
      store: storeId,
      ...params,
    });

    if (format === "json") {
      return this.get(`${this.endpoint}/tally/export`, { store: storeId, ...params });
    }

    const response = await this.authAxios.get(url, { responseType: "text" });
    const disposition = response.headers?.["content-disposition"] || "";
    const match = disposition.match(/filename="([^"]+)"/);
    return {
      data: {
        data: {
          xml: response.data,
          filename: match?.[1] || "tally-export.xml",
        },
        message: "Tally export downloaded",
      },
    };
  }
}

export const tallyService = new TallyService();
export default tallyService;

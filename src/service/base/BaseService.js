import { HttpService } from "@dragorbit/core/api";
import {
  authAxios,
  unauthAxios,
  uploadAxios,
} from "@/service/config/axiosConfig";
export class BaseService extends HttpService {
  constructor() {
    super({ authAxios, unauthAxios, uploadAxios });
  }
}

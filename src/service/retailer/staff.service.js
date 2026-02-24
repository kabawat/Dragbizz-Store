import { BaseService } from "@/service/base/BaseService";
import { API_CONFIG } from "@/config";

class StaffService extends BaseService {
    constructor() {
        super();
        this.endpoint = API_CONFIG.RETAILER.STAFF;
    }

    // Get all staff (ACTIVE + PENDING) for the agency
    async getStaff() {
        return this.get(`${this.endpoint}`);
    }

    // Invite a new staff member to the store
    async inviteStaff(data) {
        return this.post(`${this.endpoint}`, data);
    }

    // Cancel a pending staff invitation (TempStaff)
    async deleteTempStaff(staffId) {
        return this.delete(`${this.endpoint}/temp/${staffId}`);
    }

    // Remove an active staff member (marks as REMOVED)
    async removeStaff(staffId) {
        return this.delete(`${this.endpoint}/${staffId}`);
    }


    // Verify staff account using token from email
    async verifyStaff(token) {
        return this.unauthPost(`${this.endpoint}/verify`, { token });
    }
}

const staffService = new StaffService();
export default staffService;

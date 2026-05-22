"use client";
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

    // Get a single staff member's profile
    async getStaffProfile(id = "profile") {
        return this.get(`${this.endpoint}/${id}`);
    }

    // Invite a new staff member to the store
    async inviteStaff(data) {
        return this.post(`${this.endpoint}`, data);
    }

    // Cancel a pending staff invitation (TempStaff)
    async deleteTempStaff(staffId) {
        return this.delete(`${this.endpoint}/temp/${staffId}`);
    }

    // Resend a pending staff invitation
    async resendStaffInvite(staffId) {
        return this.post(`${this.endpoint}/resend/${staffId}`);
    }

    // Remove an active staff member (marks as REMOVED)
    async removeStaff(staffId) {
        return this.delete(`${this.endpoint}/${staffId}`);
    }

    // Update staff details
    async updateStaff(staffId, data) {
        return this.put(`${this.endpoint}/${staffId}`, data);
    }

}

const staffService = new StaffService();
export default staffService;

import { AdminRepository } from "@/Repositories/AdminRepository";

export class AdminDashboardService {
  constructor(private readonly adminRepository = new AdminRepository()) {}

  async getCounts() {
    return this.adminRepository.getDashboardCounts();
  }
}

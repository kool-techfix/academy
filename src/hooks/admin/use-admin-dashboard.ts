"use client";

import { useQuery } from "@tanstack/react-query";

import { ADMIN_DASHBOARD_QUERY_KEY } from "@/hooks/admin/admin-query-keys";
import { adminApi } from "@/Services/admin.service";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEY,
    queryFn: adminApi.getDashboard,
  });
}

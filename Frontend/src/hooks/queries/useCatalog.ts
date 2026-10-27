import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalogService";

/**
 * Hook Query: Lấy danh sách toàn bộ 63 tỉnh/thành phố
 * Cache 24 giờ vì danh mục địa chính là master data tĩnh
 */
export const useProvinces = (search?: string) => {
  return useQuery({
    queryKey: ["catalog", "provinces", search],
    queryFn: () => catalogService.getProvinces({ search, pageSize: 100 }),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

/**
 * Hook Query: Lấy danh sách phường/xã theo tỉnh/thành phố
 * Tự động kích hoạt khi có provinceId
 */
export const useWards = (provinceId?: string, search?: string) => {
  return useQuery({
    queryKey: ["catalog", "wards", provinceId, search],
    queryFn: () => catalogService.getWards({ provinceId, search, pageSize: 100 }),
    enabled: Boolean(provinceId),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
};

/**
 * Hook Query: Lấy toàn bộ 8 nhóm ngành kèm danh sách ngành nghề con
 * Phục vụ Grouped Multi-select khi tạo tin và bộ lọc tìm kiếm
 */
export const useIndustryGroupsWithIndustries = () => {
  return useQuery({
    queryKey: ["catalog", "industry-groups-with-industries"],
    queryFn: () => catalogService.getIndustryGroupsWithIndustries({ pageSize: 20 }),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

/**
 * Hook Query: Lấy danh sách ngành nghề (có thể lọc theo groupId)
 */
export const useIndustries = (groupId?: string, search?: string) => {
  return useQuery({
    queryKey: ["catalog", "industries", groupId, search],
    queryFn: () => catalogService.getIndustries({ groupId, search, pageSize: 100 }),
    staleTime: 24 * 60 * 60 * 1000,
  });
};

/**
 * Hook Query: Lấy danh mục kỹ năng (hỗ trợ tìm kiếm theo từ khóa)
 */
export const useSkills = (search?: string) => {
  return useQuery({
    queryKey: ["catalog", "skills", search],
    queryFn: () => catalogService.getSkills({ search, pageSize: 100 }),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

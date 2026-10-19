import { useMutation } from "@tanstack/react-query";
import { mediaService } from "@/services/mediaService";

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        throw new Error(
          "Định dạng ảnh không hỗ trợ. Vui lòng chọn .jpg, .png hoặc .webp",
        );
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Kích thước ảnh vượt quá giới hạn 5 MB.");
      }

      const response = await mediaService.uploadImage(file);
      return response.data;
    },
  });
};

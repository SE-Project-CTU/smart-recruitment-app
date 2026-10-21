export interface MediaFile {
  id: string;
  ownerId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface DeleteMediaResult {
  id: string;
  deleted: boolean;
}

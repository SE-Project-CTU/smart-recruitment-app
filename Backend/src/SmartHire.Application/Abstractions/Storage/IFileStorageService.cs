namespace SmartHire.Application.Abstractions.Storage;

public interface IFileStorageService {
    Task<FileUploadResult> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        string folder,
        CancellationToken cancellationToken);

    Task DeleteAsync(string publicId, CancellationToken cancellationToken);
}

public sealed record FileUploadResult(
    string FileUrl,
    string PublicId
);

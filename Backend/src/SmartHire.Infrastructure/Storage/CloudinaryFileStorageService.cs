using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using SmartHire.Application.Abstractions.Storage;

namespace SmartHire.Infrastructure.Storage;

public sealed class CloudinaryFileStorageService : IFileStorageService {
    private readonly Cloudinary _cloudinary;

    public CloudinaryFileStorageService(IOptions<CloudinaryOptions> options) {
        var opt = options.Value;
        var account = new Account(opt.CloudName, opt.ApiKey, opt.ApiSecret);
        _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
    }

    /// <inheritdoc/>
    public async Task<FileUploadResult> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        string folder,
        CancellationToken cancellationToken) {
        var uploadParams = contentType.Equals(
            "application/pdf",
            StringComparison.OrdinalIgnoreCase)
            ? BuildRawUploadParams(stream, fileName, folder)
            : BuildImageUploadParams(stream, fileName, folder);

        var result = await _cloudinary.UploadAsync(uploadParams).ConfigureAwait(false);

        if (result.Error is not null) {
            throw new InvalidOperationException(
                $"Cloudinary upload failed: {result.Error.Message}");
        }

        return new FileUploadResult(
            FileUrl: result.SecureUrl.ToString(),
            PublicId: result.PublicId);
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(string publicId, CancellationToken cancellationToken) {
        var deleteParams = new DeletionParams(publicId) {
            ResourceType = publicId.Contains("/documents/")
                ? ResourceType.Raw
                : ResourceType.Image
        };

        var result = await _cloudinary.DestroyAsync(deleteParams).ConfigureAwait(false);

        if (result.Result != "ok" && result.Result != "not found") {
            throw new InvalidOperationException(
                $"Cloudinary delete failed: {result.Result}");
        }
    }

    private static ImageUploadParams BuildImageUploadParams(
        Stream stream,
        string fileName,
        string folder) {
        return new ImageUploadParams {
            File = new FileDescription(fileName, stream),
            Folder = folder,
            UseFilename = false,
            UniqueFilename = true,
            Overwrite = false
        };
    }

    private static RawUploadParams BuildRawUploadParams(
        Stream stream,
        string fileName,
        string folder) {
        return new RawUploadParams {
            File = new FileDescription(fileName, stream),
            Folder = folder,
            UseFilename = false,
            UniqueFilename = true,
            Overwrite = false
        };
    }
}

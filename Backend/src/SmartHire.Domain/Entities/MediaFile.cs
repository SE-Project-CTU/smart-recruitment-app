namespace SmartHire.Domain.Entities;

public class MediaFile {
    public Guid Id { get; private set; }
    public Guid OwnerId { get; private set; }
    public User Owner { get; private set; } = null!;
    public string FileName { get; private set; } = string.Empty;
    public string FileUrl { get; private set; } = string.Empty;
    public string FileType { get; private set; } = string.Empty;
    public long FileSize { get; private set; }
    public string PublicId { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }

    public User? AvatarUser { get; private set; }
    public Company? LogoCompany { get; private set; }
    public CvTemplate? CvTemplate { get; private set; }
    public JobApplication? UploadedCvApplication { get; private set; }

    private MediaFile() { }

    public static MediaFile Create(
        Guid ownerId,
        string fileName,
        string fileUrl,
        string fileType,
        long fileSize,
        string publicId) {
        return new MediaFile {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            FileName = fileName,
            FileUrl = fileUrl,
            FileType = fileType,
            FileSize = fileSize,
            PublicId = publicId,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
}

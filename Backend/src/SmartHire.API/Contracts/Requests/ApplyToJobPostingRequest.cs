using System.ComponentModel.DataAnnotations;

namespace SmartHire.Api.Contracts.Requests;

public sealed class ApplyToJobPostingRequest {
    public Guid? CvVersionId { get; init; }
    public Guid? UploadedCvFileId { get; init; }

    [StringLength(10_000, ErrorMessage = "Cover letter must not exceed 10000 characters.")]
    public string? CoverLetter { get; init; }
}

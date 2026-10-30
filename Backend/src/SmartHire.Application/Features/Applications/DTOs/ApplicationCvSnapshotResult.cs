using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record ApplicationCvSnapshotResult(
    Guid VersionId,
    Guid CvId,
    Guid TemplateId,
    int VersionNumber,
    string Language,
    CvContentDocument Content,
    CvLayoutDocument Layout,
    DateTimeOffset CreatedAt);

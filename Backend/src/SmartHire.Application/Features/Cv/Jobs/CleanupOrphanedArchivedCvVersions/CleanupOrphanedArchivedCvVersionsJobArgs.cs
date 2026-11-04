namespace SmartHire.Application.Features.Cv.Jobs.CleanupOrphanedArchivedCvVersions;

public sealed record CleanupOrphanedArchivedCvVersionsJobArgs(
    int RetentionDays = 0
);

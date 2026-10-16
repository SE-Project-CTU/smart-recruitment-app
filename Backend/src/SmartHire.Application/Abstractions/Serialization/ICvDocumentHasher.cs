using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Abstractions.Serialization;

public interface ICvDocumentHasher
{
    CvDocumentHashes Calculate(
        CvContentDocument content,
        CvPresentationDocument presentation,
        CvLayoutDocument layout);
}

public sealed record CvDocumentHashes(
    string ContentHash,
    string PresentationHash,
    string LayoutHash);

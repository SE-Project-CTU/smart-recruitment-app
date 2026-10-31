using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Abstractions.Serialization;

public interface ICvDocumentHasher
{
    CvDocumentHashes Calculate(
        CvContentDocument content,
        CvLayoutDocument layout);
}

public sealed record CvDocumentHashes(
    string ContentHash,
    string LayoutHash);

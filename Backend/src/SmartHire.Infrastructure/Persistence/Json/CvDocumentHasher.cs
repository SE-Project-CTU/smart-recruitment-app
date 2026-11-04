using System.Security.Cryptography;
using Org.Webpki.JsonCanonicalizer;
using SmartHire.Application.Abstractions.Serialization;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Infrastructure.Persistence.Json;

public sealed class CvDocumentHasher : ICvDocumentHasher
{
    public CvDocumentHashes Calculate(
        CvContentDocument content,
        CvLayoutDocument layout) => new(
        CalculateContentHash(content),
        CalculateHash(layout));

    public static string CalculateContentHash(CvContentDocument content)
    {
        ArgumentNullException.ThrowIfNull(content);

        var normalizedMetadata = content.Metadata is null
            ? new CvDocumentMetadata()
            : content.Metadata with
            {
                Version = string.Empty,
                UpdatedAt = DateTimeOffset.MinValue
            };

        var normalizedContent = content with
        {
            Metadata = normalizedMetadata
        };

        return CalculateHash(normalizedContent);
    }

    public static string CalculateHash<TDocument>(TDocument document)
    {
        ArgumentNullException.ThrowIfNull(document);

        var json = CvJsonSerializer.Serialize(document);
        var canonicalJson = new JsonCanonicalizer(json).GetEncodedUTF8();
        var hash = SHA256.HashData(canonicalJson);

        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}

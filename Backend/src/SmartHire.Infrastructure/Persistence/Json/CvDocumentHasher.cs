using System.Security.Cryptography;
using Org.Webpki.JsonCanonicalizer;
using SmartHire.Application.Abstractions.Serialization;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Infrastructure.Persistence.Json;

public sealed class CvDocumentHasher : ICvDocumentHasher
{
    public CvDocumentHashes Calculate(
        CvContentDocument content,
        CvPresentationDocument presentation,
        CvLayoutDocument layout) => new(
        CalculateHash(content),
        CalculateHash(presentation),
        CalculateHash(layout));

    public static string CalculateHash<TDocument>(TDocument document)
    {
        ArgumentNullException.ThrowIfNull(document);

        var json = CvJsonSerializer.Serialize(document);
        var canonicalJson = new JsonCanonicalizer(json).GetEncodedUTF8();
        var hash = SHA256.HashData(canonicalJson);

        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}

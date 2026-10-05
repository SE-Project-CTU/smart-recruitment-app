using Pgvector;

namespace SmartHire.Domain.Entities;

public class CvEmbedding {
    public Guid Id { get; private set; }
    public Guid CvVersionId { get; private set; }
    public CvVersion CvVersion { get; private set; } = null!;
    public Vector Embedding { get; private set; } = null!;
    public string Model { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }

    private CvEmbedding() { }
}

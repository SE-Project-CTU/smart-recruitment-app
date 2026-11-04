using Pgvector;

namespace SmartHire.Domain.Entities;

public class JobEmbedding {
    public Guid Id { get; private set; }
    
    public Guid JobId { get; private set; }
    public JobPosting Job { get; private set; } = null!;
    
    public Vector? Embedding { get; private set; } = null!;
    public string Model { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
    
    private JobEmbedding() { }

    public static JobEmbedding Create(
        Guid jobId,
        Vector embedding,
        string model,
        DateTimeOffset createdAt) {
        return new JobEmbedding {
            Id = Guid.NewGuid(),
            JobId = jobId,
            Embedding = embedding,
            Model = model,
            CreatedAt = createdAt
        };
    }

    public void Update(Vector embedding, string model) {
        Embedding = embedding;
        Model = model;
    }
}
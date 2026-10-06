using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class Ward {
    public Guid Id { get; private set; }
    
    public Guid ProvinceId { get; private set; }
    public Province Province { get; private set; } = null!;
    
    public string Name { get; private set; } = string.Empty;
    public LocationStatus Status { get; private set; }
    
    public ICollection<JobPosting> JobPostings { get; private set; }
        = new List<JobPosting>();
    
    private Ward() { }
}
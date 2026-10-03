namespace SmartHire.Domain.Entities;

public class JobIndustry {
    public Guid JobId { get; private set; }
    public JobPosting Job { get; private set; } = null!;
    
    public Guid IndustryId { get; private set; }
    public Industry Industry { get; private set; } = null!;
    
    private JobIndustry() { }
}
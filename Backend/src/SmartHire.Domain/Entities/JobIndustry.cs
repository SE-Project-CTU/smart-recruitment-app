namespace SmartHire.Domain.Entities;

public class JobIndustry {
    public Guid JobId { get; private set; }
    public JobPosting Job { get; private set; } = null!;
    
    public Guid IndustryId { get; private set; }
    public Industry Industry { get; private set; } = null!;
    
    private JobIndustry() { }

    public static JobIndustry Create(JobPosting job, Guid industryId) {
        ArgumentNullException.ThrowIfNull(job);
        if (industryId == Guid.Empty) {
            throw new ArgumentException("IndustryId is required.", nameof(industryId));
        }

        return new JobIndustry { Job = job, IndustryId = industryId };
    }
}

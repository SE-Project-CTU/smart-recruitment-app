namespace SmartHire.Domain.Entities;

public class JobSkill {
    public Guid JobId { get; private set; }
    public JobPosting Job { get; private set; } = null!;
    
    public Guid SkillId { get; private set; }
    public Skill Skill { get; private set; } = null!;
    
    private JobSkill() { }
}
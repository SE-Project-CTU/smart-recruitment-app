namespace SmartHire.Domain.Entities;

public class Skill {
    public Guid Id { get; private set; }
    
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    
    public ICollection<JobSkill> JobSkills { get; private set; }
        = new List<JobSkill>();
    
    private Skill() { }
}
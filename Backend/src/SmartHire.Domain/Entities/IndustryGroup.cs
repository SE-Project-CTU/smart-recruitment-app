namespace SmartHire.Domain.Entities;

public class IndustryGroup {
    public Guid Id { get; private set; }
    
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    
    public ICollection<Industry> Industries { get; private set; }
        = new List<Industry>();
    
    private IndustryGroup() { }
}
using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class Industry {
    public Guid Id { get; private set; }
    
    public Guid GroupId { get; private set; }
    public IndustryGroup Group { get; private set; } = null!;
    
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    
    private Industry() { }
}
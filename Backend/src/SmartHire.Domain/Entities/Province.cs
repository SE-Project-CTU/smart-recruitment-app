using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class Province {
    public Guid Id { get; private set; }
    
    public string Name { get; private set; } = string.Empty;
    public LocationStatus Status { get; private set; }
    
    public ICollection<Ward> Wards { get; private set; }
        = new List<Ward>();
}
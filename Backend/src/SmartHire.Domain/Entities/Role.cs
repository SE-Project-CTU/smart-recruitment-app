namespace SmartHire.Domain.Entities;

public class Role {
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    
    public ICollection<UserRole> UserRoles { get; private set; } = new List<UserRole>();
    
    private Role() {}
}
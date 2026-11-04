namespace SmartHire.Domain.Entities;

public class RolePermission {
    public Guid RoleId { get; private set; }
    public Role Role { get; private set; } = null!;

    public Guid PermissionId { get; private set; }
    public Permission Permission { get; private set; } = null!;

    public DateTimeOffset AssignedAt { get; private set; }

    private RolePermission() { }

    public RolePermission(Guid roleId, Guid permissionId, DateTimeOffset assignedAt) {
        if (roleId == Guid.Empty)
            throw new ArgumentException("RoleId is required.", nameof(roleId));
        if (permissionId == Guid.Empty)
            throw new ArgumentException("PermissionId is required.", nameof(permissionId));

        RoleId = roleId;
        PermissionId = permissionId;
        AssignedAt = assignedAt;
    }
}
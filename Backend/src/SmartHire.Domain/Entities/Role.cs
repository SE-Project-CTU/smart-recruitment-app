namespace SmartHire.Domain.Entities;

public class Role {
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;

    public ICollection<UserRole> UserRoles { get; private set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();

    private Role() {}

    public static Role Create(string name) {
        if (string.IsNullOrWhiteSpace(name)) {
            throw new ArgumentException("Role name is required.", nameof(name));
        }

        return new Role { Name = name.Trim() };
    }

    /// <summary>
    /// Thay the toan bo danh sach quyen han cua role.
    /// Caller phai dam bao da load RolePermissions truoc khi goi.
    /// </summary>
    public void ReplacePermissions(IEnumerable<Guid> permissionIds, DateTimeOffset now) {
        RolePermissions.Clear();
        foreach (var permId in permissionIds.Distinct()) {
            if (permId == Guid.Empty) continue;
            RolePermissions.Add(new RolePermission(Id, permId, now));
        }
    }
}
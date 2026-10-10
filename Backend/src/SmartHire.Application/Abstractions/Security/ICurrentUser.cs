namespace SmartHire.Application.Abstractions.Security;

public interface ICurrentUser {
    Guid? UserId { get; }
    IReadOnlyList<string> Roles { get; }
}
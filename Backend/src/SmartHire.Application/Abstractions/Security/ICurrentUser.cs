namespace SmartHire.Application.Abstractions.Security;

public interface ICurrentUser {
    Guid? UserId { get; }
}
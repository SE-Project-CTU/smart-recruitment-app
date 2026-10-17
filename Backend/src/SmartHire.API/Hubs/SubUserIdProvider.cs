using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace SmartHire.Api.Hubs;

public class SubUserIdProvider : IUserIdProvider {
    public string? GetUserId(HubConnectionContext connection) {
        return connection.User.FindFirstValue("sub")
               ?? connection.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}

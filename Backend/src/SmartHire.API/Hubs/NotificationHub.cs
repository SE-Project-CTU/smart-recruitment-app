using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SmartHire.Api.Hubs;

[Authorize]
public class NotificationHub : Hub {
}

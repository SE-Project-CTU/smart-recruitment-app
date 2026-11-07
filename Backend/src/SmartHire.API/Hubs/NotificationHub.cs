using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Notifications.Constants;
using SmartHire.Domain.Enums;

namespace SmartHire.Api.Hubs;

[Authorize]
public class NotificationHub : Hub {
    private readonly ICompanyRepository _companyRepository;
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ICompanyRepository companyRepository, ILogger<NotificationHub> logger) {
        _companyRepository = companyRepository;
        _logger = logger;
    }

    public override async Task OnConnectedAsync() {
        await Groups.AddToGroupAsync(Context.ConnectionId, NotificationGroups.SystemAll);

        if (Context.User is { } user) {
            // Tự động tham gia các group theo Role (Admin, Recruiter, Candidate)
            var roles = user.FindAll(ClaimTypes.Role)
                .Concat(user.FindAll("role"))
                .Select(c => c.Value)
                .Distinct(StringComparer.OrdinalIgnoreCase);

            foreach (var role in roles) {
                await Groups.AddToGroupAsync(Context.ConnectionId, NotificationGroups.Role(role));
            }

            // Tự động tham gia các Company groups nếu user có active membership
            if (Guid.TryParse(Context.UserIdentifier, out var userId)) {
                try {
                    var companyIds = await _companyRepository.GetActiveCompanyIdsForUserAsync(userId, Context.ConnectionAborted);
                    foreach (var companyId in companyIds) {
                        await Groups.AddToGroupAsync(Context.ConnectionId, NotificationGroups.Company(companyId));
                    }
                }
                catch (Exception ex) {
                    _logger.LogWarning(ex, "Could not resolve active companies for user {UserId} upon SignalR connection.", userId);
                }
            }
        }

        await base.OnConnectedAsync();
    }

    public async Task JoinCompanyGroup(Guid companyId) {
        if (companyId == Guid.Empty) return;

        if (Context.User is not { } user || !Guid.TryParse(Context.UserIdentifier, out var userId)) {
            throw new HubException("Yêu cầu xác thực không hợp lệ.");
        }

        var isAdmin = user.IsInRole("Admin") || user.HasClaim(c => (c.Type == ClaimTypes.Role || c.Type == "role") && string.Equals(c.Value, "Admin", StringComparison.OrdinalIgnoreCase));
        if (!isAdmin) {
            var membership = await _companyRepository.GetMembershipAsync(companyId, userId, Context.ConnectionAborted);
            if (membership is null || membership.Status != CompanyMembershipStatus.Active) {
                throw new HubException("Bạn không có quyền truy cập nhóm thông báo của công ty này.");
            }
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, NotificationGroups.Company(companyId));
    }

    public async Task LeaveCompanyGroup(Guid companyId) {
        if (companyId == Guid.Empty) return;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, NotificationGroups.Company(companyId));
    }

    public async Task JoinJobGroup(Guid jobId) {
        if (jobId == Guid.Empty) return;
        await Groups.AddToGroupAsync(Context.ConnectionId, NotificationGroups.Job(jobId));
    }

    public async Task LeaveJobGroup(Guid jobId) {
        if (jobId == Guid.Empty) return;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, NotificationGroups.Job(jobId));
    }
}

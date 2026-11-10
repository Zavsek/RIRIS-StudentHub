using Microsoft.AspNetCore.SignalR;

namespace StudentHubAPI.Hubs;

public sealed class QaHub : Hub
{
    public async Task JoinQuestion(int questionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"question-{questionId}");
    }

    public async Task LeaveQuestion(int questionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"question-{questionId}");
    }
}

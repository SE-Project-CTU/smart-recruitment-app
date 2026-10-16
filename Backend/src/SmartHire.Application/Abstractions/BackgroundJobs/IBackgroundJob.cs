namespace SmartHire.Application.Abstractions.BackgroundJobs;

/// <summary>
/// Represents one background operation that can be invoked by a job processor.
/// </summary>
public interface IBackgroundJob<in TArgs>
{
    Task ExecuteAsync(TArgs args, CancellationToken cancellationToken);
}

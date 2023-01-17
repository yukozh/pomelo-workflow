using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;

namespace Pomelo.Workflow.Storage
{
    /// <summary>
    /// Used for Pomelo workflow internal.
    /// </summary>
    public interface IWorkflowStorageProvider
    {
        ValueTask<IEnumerable<Models.Workflow>> GetWorkflowsAsync(string name = null, CancellationToken cancellationToken = default);

        ValueTask<IEnumerable<GetWorkflowVersionResponse>> GetWorkflowVersionsAsync(Guid id, CancellationToken cancellationToken = default);

        ValueTask<WorkflowVersion> GetWorkflowVersionAsync(Guid id, int version, CancellationToken cancellationToken);

        ValueTask<Models.Workflow> GetWorkflowAsync(Guid id, CancellationToken cancellationToken = default);

        ValueTask DeleteWorkflowAsync(Guid id, CancellationToken cancellationToken = default);

        ValueTask UpdateWorkflowAsync(Guid id, UpdateWorkflowRequest request, CancellationToken cancellationToken);

        ValueTask<Guid> CreateWorkflowAsync(CreateWorkflowRequest request, CancellationToken cancellationToken);

        ValueTask<int> CreateWorkflowVersion(Guid id, CreateWorkflowVersionRequest request, CancellationToken cancellationToken);
    }
}

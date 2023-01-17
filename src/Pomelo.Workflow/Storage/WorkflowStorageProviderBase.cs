using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;

namespace Pomelo.Workflow.Storage
{
    /// <summary>
    /// Used for Pomelo workflow internal.
    /// </summary>
    public abstract class WorkflowStorageProviderBase
    {
        public abstract ValueTask<IEnumerable<Models.Workflow>> GetWorkflowsAsync(CancellationToken cancellationToken = default);

        public abstract ValueTask<IEnumerable<GetWorkflowVersionResponse>> GetWorkflowVersionsAsync(Guid id, CancellationToken cancellationToken = default);

        public abstract ValueTask<WorkflowVersion> GetWorkflowVersionAsync(Guid id, int version, CancellationToken cancellationToken);

        public abstract ValueTask<Models.Workflow> GetWorkflowAsync(Guid id, CancellationToken cancellationToken = default);

        public abstract ValueTask DeleteWorkflowAsync(Guid id, CancellationToken cancellationToken = default);

        public abstract ValueTask UpdateWorkflowAsync(Guid id, UpdateWorkflowRequest request, CancellationToken cancellationToken);

        public abstract ValueTask<Guid> CreateWorkflowAsync(CreateWorkflowRequest request, CancellationToken cancellationToken);

        public abstract ValueTask<int> CreateWorkflowVersion(Guid id, CreateWorkflowVersionRequest request, CancellationToken cancellationToken);
    }
}

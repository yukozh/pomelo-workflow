using Newtonsoft.Json.Linq;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;
using System.Runtime.CompilerServices;

namespace Pomelo.Workflow.Storage
{
    /// <summary>
    /// Used for Pomelo workflow internal.
    /// </summary>
    public interface IWorkflowStorageProvider
    {
        ValueTask<IEnumerable<Models.Workflow>> GetWorkflowsAsync(
            string name = null, 
            CancellationToken cancellationToken = default);

        ValueTask<IEnumerable<GetWorkflowVersionResult>> GetWorkflowVersionsAsync(
            Guid id, 
            CancellationToken cancellationToken = default);

        ValueTask<WorkflowVersion> GetWorkflowVersionAsync(
            Guid id, 
            int version, 
            CancellationToken cancellationToken);

        ValueTask<Models.Workflow> GetWorkflowAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        ValueTask DeleteWorkflowAsync(
            Guid id, 
            CancellationToken cancellationToken = default);

        ValueTask UpdateWorkflowAsync(
            Guid id, 
            UpdateWorkflowRequest request, 
            CancellationToken cancellationToken = default);

        ValueTask<Guid> CreateWorkflowAsync(
            CreateWorkflowRequest request, 
            CancellationToken cancellationToken = default);

        ValueTask<int> CreateWorkflowVersion(
            Guid id, 
            CreateWorkflowVersionRequest request, 
            CancellationToken cancellationToken = default);

        ValueTask<int?> GetLatestVersionAsync(
            Guid id,
            WorkflowVersionStatus? status = WorkflowVersionStatus.Available,
            CancellationToken cancellationToken = default);

        ValueTask UpdateWorkflowVersionStatusAsync(
            Guid id,
            int version, 
            WorkflowVersionStatus status, 
            CancellationToken cancellationToken = default);

        ValueTask<Guid> CreateWorkflowInstanceAsync(
            Guid id,
            int version,
            Dictionary<string, JToken> arguments,
            CancellationToken cancellationToken = default);

        ValueTask<Guid> CreateWorkflowStepAsync(
            Guid instanceId,
            Step step,
            CancellationToken cancellationToken = default);

        ValueTask<WorkflowInstance> GetWorkflowInstanceAsync(
            Guid instanceId,
            CancellationToken cancellationToken = default);

        ValueTask<UpdateWorkflowInstanceResult> UpdateWorkflowInstanceAsync(
            Guid instanceId,
            WorkflowStatus status,
            Action<Dictionary<string, JToken>> updateArgumentsDelegate,
            CancellationToken cancellationToken = default);

        ValueTask<UpdateWorkflowStepResult> UpdateWorkflowStepAsync(
            Guid stepId,
            StepStatus status,
            Action<Dictionary<string, JToken>> updateArgumentsDelegate,
            string error = null,
            CancellationToken cancellationToken = default);

        ValueTask<Step> GetStepByShapeId(
            Guid instanceId,
            Guid shapeId,
            CancellationToken cancellationToken = default);

        ValueTask<Step> GetStepAsync(
            Guid stepId,
            CancellationToken cancellationToken = default);

        ValueTask<GetPreviousStepsResult> GetPreviousStepsAsync(
            Guid stepId,
            CancellationToken cancellationToken = default);

        ValueTask UpdateWorkflowInstanceUpdateTimeAsync(
            Guid instanceId,
            CancellationToken cancellationToken = default);
    }
}

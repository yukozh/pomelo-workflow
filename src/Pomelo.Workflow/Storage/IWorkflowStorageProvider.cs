// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

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
            Guid workflowId, 
            CancellationToken cancellationToken = default);

        ValueTask<WorkflowVersion> GetWorkflowVersionAsync(
            Guid workflowId, 
            int version, 
            CancellationToken cancellationToken);

        ValueTask<Models.Workflow> GetWorkflowAsync(
            Guid workflowId,
            CancellationToken cancellationToken = default);

        ValueTask DeleteWorkflowAsync(
            Guid workflowId, 
            CancellationToken cancellationToken = default);

        ValueTask UpdateWorkflowAsync(
            Guid workflowId, 
            UpdateWorkflowRequest request, 
            CancellationToken cancellationToken = default);

        ValueTask<Guid> CreateWorkflowAsync(
            CreateWorkflowRequest request, 
            CancellationToken cancellationToken = default);

        ValueTask<int> CreateWorkflowVersion(
            Guid workflowId, 
            CreateWorkflowVersionRequest request, 
            CancellationToken cancellationToken = default);

        ValueTask<int?> GetLatestVersionAsync(
            Guid workflowId,
            WorkflowVersionStatus? status = WorkflowVersionStatus.Available,
            CancellationToken cancellationToken = default);

        ValueTask UpdateWorkflowVersionStatusAsync(
            Guid workflowId,
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
            WorkflowInstanceStep step,
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

        ValueTask<WorkflowInstanceStep> GetStepByShapeId(
            Guid instanceId,
            Guid shapeId,
            CancellationToken cancellationToken = default);

        ValueTask<WorkflowInstanceStep> GetWorkflowInstanceStepAsync(
            Guid stepId,
            CancellationToken cancellationToken = default);

        ValueTask<GetPreviousStepsResult> GetPreviousStepsAsync(
            Guid stepId,
            CancellationToken cancellationToken = default);

        ValueTask UpdateWorkflowInstanceUpdateTimeAsync(
            Guid instanceId,
            CancellationToken cancellationToken = default);

        ValueTask<IEnumerable<WorkflowInstanceStep>> GetInstanceStepsAsync(
            Guid instanceId, 
            CancellationToken cancellationToken = default);
    }
}

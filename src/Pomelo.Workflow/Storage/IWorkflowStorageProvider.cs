// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;
using Newtonsoft.Json.Linq;
using System.ComponentModel;

namespace Pomelo.Workflow.Storage
{
    /// <summary>
    /// Used for Pomelo workflow internal.
    /// </summary>
    public interface IWorkflowStorageProvider
    {
        Task<IEnumerable<Models.Workflow>> GetWorkflowsAsync(
            string name = null,
            CancellationToken cancellationToken = default);

        Task<IEnumerable<GetWorkflowVersionResult>> GetWorkflowVersionsAsync(
            Guid workflowId, 
            CancellationToken cancellationToken = default);

        Task<WorkflowVersion> GetWorkflowVersionAsync(
            Guid workflowId, 
            int version, 
            CancellationToken cancellationToken);

        Task<Models.Workflow> GetWorkflowAsync(
            Guid workflowId,
            CancellationToken cancellationToken = default);

        Task DeleteWorkflowAsync(
            Guid workflowId, 
            CancellationToken cancellationToken = default);

        Task UpdateWorkflowAsync(
            Guid workflowId, 
            UpdateWorkflowRequest request, 
            CancellationToken cancellationToken = default);

        Task<Guid> CreateWorkflowAsync(
            CreateWorkflowRequest request, 
            CancellationToken cancellationToken = default);

        Task<int> CreateWorkflowVersion(
            Guid workflowId, 
            CreateWorkflowVersionRequest request, 
            CancellationToken cancellationToken = default);

        Task<int?> GetLatestVersionAsync(
            Guid workflowId,
            WorkflowVersionStatus? status = WorkflowVersionStatus.Available,
            CancellationToken cancellationToken = default);

        Task UpdateWorkflowVersionStatusAsync(
            Guid workflowId,
            int version, 
            WorkflowVersionStatus status, 
            CancellationToken cancellationToken = default);

        Task<Guid> CreateWorkflowInstanceAsync(
            Guid id,
            int version,
            Dictionary<string, JToken> arguments,
            CancellationToken cancellationToken = default);

        Task<Guid> CreateWorkflowStepAsync(
            Guid instanceId,
            WorkflowInstanceStep step,
            CancellationToken cancellationToken = default);

        Task<WorkflowInstance> GetWorkflowInstanceAsync(
            Guid instanceId,
            CancellationToken cancellationToken = default);

        Task<UpdateWorkflowInstanceResult> UpdateWorkflowInstanceAsync(
            Guid instanceId,
            WorkflowStatus status,
            Action<Dictionary<string, JToken>> updateArgumentsDelegate,
            CancellationToken cancellationToken = default);

        Task<UpdateWorkflowStepResult> UpdateWorkflowStepAsync(
            Guid stepId,
            StepStatus status,
            Action<Dictionary<string, JToken>> updateArgumentsDelegate,
            string error = null,
            CancellationToken cancellationToken = default);

        Task<WorkflowInstanceStep> GetStepByShapeIdAsync(
            Guid instanceId,
            Guid shapeId,
            CancellationToken cancellationToken = default);

        Task<WorkflowInstanceStep> GetWorkflowInstanceStepAsync(
            Guid stepId,
            CancellationToken cancellationToken = default);

        Task<GetPreviousStepsResult> GetPreviousStepsAsync(
            Guid stepId,
            CancellationToken cancellationToken = default);

        Task UpdateWorkflowInstanceUpdateTimeAsync(
            Guid instanceId,
            CancellationToken cancellationToken = default);

        Task<IEnumerable<WorkflowInstanceStep>> GetInstanceStepsAsync(
            Guid instanceId, 
            CancellationToken cancellationToken = default);

        Task<IEnumerable<GetWorkflowInstanceResult>> GetWorkflowInstancesAsync(
            Guid workflowId,
            int? version,
            CancellationToken cancellationToken = default);

        Task<IEnumerable<WorkflowInstanceConnection>> GetWorkflowInstanceConnectionsAsync(
            Guid instanceId,
            CancellationToken cancellationToken = default);

        Task CreateWorkflowInstanceConnectionAsync(
            WorkflowInstanceConnection request, 
            CancellationToken cancellationToken = default);
    }
}

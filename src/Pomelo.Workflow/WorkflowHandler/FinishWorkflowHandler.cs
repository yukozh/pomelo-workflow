// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;
using System.Threading;
using System.Threading.Tasks;

namespace Pomelo.Workflow.WorkflowHandler
{
    [WorkflowHandler("finish")]
    public class FinishWorkflowHandler : WorkflowHandlerBase
    {
        public FinishWorkflowHandler(
            WorkflowManager workflowManager,
            WorkflowInstanceStep step)
            : base(workflowManager, step)
        { }

        public override async Task OnPreviousStepFinishedAsync(
            WorkflowInstanceStep previousStep,
            ConnectionType connection,
            bool allPreviousStepsFinished,
            CancellationToken cancellationToken)
        {
            if (allPreviousStepsFinished)
            {
                await WorkflowManager.UpdateWorkflowStepAsync(CurrentStep.Id, StepStatus.Succeeded, null, null, cancellationToken);
                await WorkflowManager.UpdateWorkflowInstanceAsync(CurrentStep.WorkflowInstanceId, WorkflowStatus.Finished, null, cancellationToken);
            }
        }

        public override Task OnStepStatusChangedAsync(
            StepStatus newStatus,
            StepStatus previousStatus,
            CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}

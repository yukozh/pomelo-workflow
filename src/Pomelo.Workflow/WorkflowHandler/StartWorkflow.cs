// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.Extensions.DependencyInjection;
using Pomelo.Workflow.Models;

namespace Pomelo.Workflow.WorkflowHandler
{
    [WorkflowHandler("start")]
    public class StartWorkflowHandler : WorkflowHandlerBase
    {
        public StartWorkflowHandler(
            WorkflowManager workflowManager, 
            WorkflowInstanceStep step) 
            : base(workflowManager, step) 
        { }

        public override ValueTask OnPreviousStepFinishedAsync(
            WorkflowInstanceStep previousStep,
            bool allPreviousStepsFinished, 
            CancellationToken cancellationToken)
        {
            return ValueTask.CompletedTask;
        }

        public override async ValueTask OnStepStatusChangedAsync(
            StepStatus newStatus,
            StepStatus previousStatus,
            CancellationToken cancellationToken)
        {
            switch(newStatus)
            {
                case StepStatus.InProgress:
                    await WorkflowManager.UpdateWorkflowStepAsync(CurrentStep.Id, StepStatus.Succeeded, null, null, cancellationToken);
                    break;
                case StepStatus.Succeeded:
                    // TODO: Get or create next step  
                    break;
            }
        }
    }
}

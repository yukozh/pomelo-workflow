// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System.Threading;
using System.Threading.Tasks;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;

namespace Pomelo.Workflow.WorkflowHandler
{
    public abstract class ProcessWorkflowBase : WorkflowHandlerBase
    {
        public ProcessWorkflowBase(
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
                await WorkflowManager.UpdateWorkflowStepAsync(
                    CurrentStep.Id,
                    StepStatus.InProgress,
                    null,
                    null,
                    cancellationToken);
            }
        }

        public override Task OnStepStatusChangedAsync(
            StepStatus newStatus, 
            StepStatus previousStatus, 
            CancellationToken cancellationToken)
        {
            switch (newStatus)
            {
                case StepStatus.InProgress:
                    break;
                case StepStatus.Succeeded:
                    break;
                case StepStatus.Failed:
                    break;
            }

            return Task.CompletedTask;
        }
    }
}

// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;
using System.Threading;
using System.Threading.Tasks;

namespace Pomelo.Workflow.WorkflowHandler
{
    public abstract class WorkflowHandlerBase
    {
        protected readonly WorkflowManager WorkflowManager;
        protected readonly WorkflowInstanceStep CurrentStep;

        public WorkflowHandlerBase(WorkflowManager workflowManager, WorkflowInstanceStep step)
        {
            
            WorkflowManager = workflowManager;
            CurrentStep = step;
        }

        public abstract Task OnStepStatusChangedAsync(
            StepStatus newStatus,
            StepStatus previousStatus,
            CancellationToken cancellationToken);

        public abstract Task OnPreviousStepFinishedAsync(
            WorkflowInstanceStep previousStep,
            ConnectionType connection,
            bool allPreviousStepsFinished, 
            CancellationToken cancellationToken);

        public virtual Task<bool> IsAbleToMoveNextAsync(
            ConnectionType connectionToNextStep,
            Shape currentNode,
            Shape nextNode,
            CancellationToken cancellationToken = default)
            => Task.FromResult(true);
    }
}

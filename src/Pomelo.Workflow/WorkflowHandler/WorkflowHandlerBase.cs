// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;

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

        public abstract ValueTask OnStepStatusChangedAsync(
            StepStatus newStatus,
            StepStatus previousStatus,
            CancellationToken cancellationToken);

        public abstract ValueTask OnPreviousStepFinishedAsync(
            WorkflowInstanceStep previousStep,
            ConnectionType connection,
            bool allPreviousStepsFinished, 
            CancellationToken cancellationToken);

        public virtual ValueTask<bool> IsAbleToMoveNextAsync(
            ConnectionType connectionToNextStep,
            Shape currentNode,
            Shape nextNode,
            CancellationToken cancellationToken = default)
            => ValueTask.FromResult(true);
    }
}

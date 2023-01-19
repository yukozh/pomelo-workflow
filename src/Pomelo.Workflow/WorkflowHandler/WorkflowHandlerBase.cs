// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Linq;
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

        public abstract ValueTask OnStepStatusChangedAsync(StepStatus newStatus, StepStatus previousStatus, CancellationToken cancellationToken);

        public abstract ValueTask OnPreviousStepFinishedAsync(WorkflowInstanceStep previousStep, ConnectionType connection, bool allPreviousStepsFinished, CancellationToken cancellationToken);

        //public static ValueTask<bool> IsAbleToMoveNextAsync(
        //    ConnectionType connectionType,
        //    Shape currentNode,
        //    WorkflowInstanceStep currentStep,
        //    CancellationToken cancellationToken = default)
        //{
        //    return ValueTask.FromResult(true);
        //}
    }
}

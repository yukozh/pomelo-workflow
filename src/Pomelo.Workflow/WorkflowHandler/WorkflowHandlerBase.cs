// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Linq;
using Pomelo.Workflow.Models;

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

        public abstract ValueTask OnPreviousStepFinishedAsync(WorkflowInstanceStep previousStep, bool allPreviousStepsFinished, CancellationToken cancellationToken);

        public static ValueTask<bool> IsAbleToConnectToCurrentStepAsync(
            string connectType,
            Dictionary<string, JToken> connectArguments,
            Shape shape,
            WorkflowInstanceStep previousStep,
            CancellationToken cancellationToken = default)
        {
            return ValueTask.FromResult(false);
        }
    }
}

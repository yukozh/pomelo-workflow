// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;

namespace Pomelo.Workflow.WorkflowHandler
{
    public abstract class WorkflowHandlerBase : IDisposable
    {
        protected readonly WorkflowManager WorkflowManager;
        protected readonly WorkflowInstanceStep CurrentStep;
        protected readonly IServiceProvider Services;

        public WorkflowHandlerBase(IServiceProvider services, WorkflowManager workflowManager, WorkflowInstanceStep step)
        {
            Services = services;
            WorkflowManager = workflowManager;
            CurrentStep = step;
        }

        public abstract Task OnStepStatusChangedAsync(
            StepStatus newStatus,
            StepStatus previousStatus,
            CancellationToken cancellationToken);

        public abstract Task OnPreviousStepFinishedAsync(
            IEnumerable<ConnectionTypeWithDeparture> finishedSteps,
            CancellationToken cancellationToken);

        public virtual Task<bool> IsAbleToMoveNextAsync(
            ConnectionType connectionToNextStep,
            Shape currentNode,
            Shape nextNode,
            CancellationToken cancellationToken = default)
            => Task.FromResult(true);

        public virtual void Dispose()
        { }
    }
}

// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pomelo.Workflow.WorkflowHandler
{
    [WorkflowHandler("finish")]
    public class FinishWorkflowHandler : WorkflowHandlerBase
    {
        public FinishWorkflowHandler(
            IServiceProvider services,
            WorkflowManager workflowManager,
            WorkflowInstanceStep step)
            : base(services, workflowManager, step)
        { }

        public override async Task OnPreviousStepFinishedAsync(
            IEnumerable<ConnectionTypeWithDeparture> finishedSteps,
            CancellationToken cancellationToken)
        {
            var steps = await WorkflowManager.GetInstanceStepsAsync(CurrentStep.WorkflowInstanceId, cancellationToken);
            if (steps.Where(x => x.Id != CurrentStep.Id).All(x => x.Status >= StepStatus.Failed))
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

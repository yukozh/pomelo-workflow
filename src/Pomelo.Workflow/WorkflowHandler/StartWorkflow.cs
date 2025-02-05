// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Pomelo.Workflow.WorkflowHandler
{
    [WorkflowHandler("start")]
    public class StartWorkflowHandler : WorkflowHandlerBase
    {
        public StartWorkflowHandler(
            IServiceProvider services,
            WorkflowManager workflowManager,
            WorkflowInstanceStep step)
            : base(services, workflowManager, step)
        { }

        public override Task OnPreviousStepFinishedAsync(
            IEnumerable<ConnectionTypeWithDeparture> stepStatuses,
            CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public override async Task OnStepStatusChangedAsync(
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

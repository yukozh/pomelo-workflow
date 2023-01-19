﻿using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;
using Pomelo.Workflow.Web.Models;
using Pomelo.Workflow.WorkflowHandler;

namespace Pomelo.Workflow.Web.Workflow
{
    [WorkflowHandler("approval")]
    public class ApprovalWorkflowHandler : WorkflowHandlerBase
    {
        readonly IServiceScope scope;

        public ApprovalWorkflowHandler(
            IServiceProvider services,
            WorkflowManager workflowManager,
            WorkflowInstanceStep step)
            : base(services, workflowManager, step)
        {
            scope = services.CreateScope();
        }

        public override Task OnPreviousStepFinishedAsync(
            IEnumerable<ConnectionTypeWithDeparture> finishedSteps,
            CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public override async Task OnStepStatusChangedAsync(
            StepStatus newStatus,
            StepStatus previousStatus,
            CancellationToken cancellationToken)
        {
            switch (newStatus)
            {
                case StepStatus.InProgress:
                    var db = scope.ServiceProvider.GetRequiredService<WfContext>();
                    db.Approvals.Add(new Approval 
                    {
                        Title = CurrentStep.Arguments["Title"].ToString(),
                        StepId = CurrentStep.Id
                    });
                    await db.SaveChangesAsync(cancellationToken);
                    break;
            }
        }

        public override void Dispose()
        {
            base.Dispose();

            scope?.Dispose();
        }
    }
}
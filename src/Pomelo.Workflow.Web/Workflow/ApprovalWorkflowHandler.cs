using Pomelo.Workflow.Models;
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

        public override async Task OnPreviousStepFinishedAsync(
            IEnumerable<ConnectionTypeWithDeparture> stepStatuses,
            CancellationToken cancellationToken)
        {
            if (CurrentStep.Status == StepStatus.NotStarted)
            {
                await WorkflowManager.UpdateWorkflowStepAsync(
                    CurrentStep.Id, StepStatus.InProgress, null, null, cancellationToken);
            }
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
                        Title = CurrentStep.Arguments?["Title"]?.ToString(),
                        StepId = CurrentStep.Id
                    });
                    await db.SaveChangesAsync(cancellationToken);
                    break;
            }
        }

        public override Task<bool> IsAbleToMoveNextAsync(
            ConnectionType connectionToNextStep,
            Shape currentNode,
            Shape nextNode,
            CancellationToken cancellationToken = default)
        {
            if (connectionToNextStep.Type == "yes")
            {
                return Task.FromResult(CurrentStep.Status == StepStatus.Succeeded);
            }
            else
            {
                return Task.FromResult(CurrentStep.Status == StepStatus.Failed);
            }
        }

        public override void Dispose()
        {
            base.Dispose();

            scope?.Dispose();
        }
    }
}

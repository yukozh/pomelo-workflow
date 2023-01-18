using Pomelo.Workflow.Models;

namespace Pomelo.Workflow.WorkflowHandler
{
    [WorkflowHandler("finish")]
    public class FinishWorkflowHandler : WorkflowHandlerBase
    {
        public FinishWorkflowHandler(WorkflowManager workflowManager, Step step) : base(workflowManager, step) 
        { }

        public override async ValueTask OnPreviousStepFinishedAsync(
            Step previousStep,
            bool allPreviousStepsFinished, 
            CancellationToken cancellationToken)
        {
            if (allPreviousStepsFinished)
            {
                await WorkflowManager.UpdateWorkflowStepAsync(CurrentStep.Id, StepStatus.Succeeded, null, null, cancellationToken);
                await WorkflowManager.UpdateWorkflowInstanceAsync(CurrentStep.WorkflowInstanceId, WorkflowStatus.Finished, null, cancellationToken);
            }
        }

        public override ValueTask OnStepStatusChangedAsync(
            StepStatus newStatus,
            StepStatus previousStatus,
            CancellationToken cancellationToken)
        {
            return ValueTask.CompletedTask;
        }
    }
}

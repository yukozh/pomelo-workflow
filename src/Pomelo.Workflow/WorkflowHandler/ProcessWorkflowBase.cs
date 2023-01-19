using Pomelo.Workflow.Models;

namespace Pomelo.Workflow.WorkflowHandler
{
    public abstract class ProcessWorkflowBase : WorkflowHandlerBase
    {
        public ProcessWorkflowBase(WorkflowManager workflowManager, WorkflowInstanceStep step) : base(workflowManager, step)
        { }

        public override async ValueTask OnPreviousStepFinishedAsync(
            WorkflowInstanceStep previousStep,
            bool allPreviousStepsFinished,
            CancellationToken cancellationToken)
        {
            if (allPreviousStepsFinished)
            {
                await WorkflowManager.UpdateWorkflowStepAsync(
                    CurrentStep.Id,
                    StepStatus.InProgress,
                    null,
                    null,
                    cancellationToken);
            }
        }

        public override ValueTask OnStepStatusChangedAsync(StepStatus newStatus, StepStatus previousStatus, CancellationToken cancellationToken)
        {
            switch (newStatus)
            {
                case StepStatus.InProgress:
                    break;
                case StepStatus.Succeeded:
                    break;
                case StepStatus.Failed:
                    break;
            }

            return ValueTask.CompletedTask;
        }
    }
}

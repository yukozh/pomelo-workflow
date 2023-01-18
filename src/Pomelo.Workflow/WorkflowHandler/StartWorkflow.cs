using Pomelo.Workflow.Models;

namespace Pomelo.Workflow.WorkflowHandler
{
    public class StartWorkflowHandler : WorkflowHandlerBase
    {
        public StartWorkflowHandler(WorkflowManager workflowManager, Step step) : base(workflowManager, step) 
        { }

        public override ValueTask OnPreviousStepFinishedAsync(Step previousStep, CancellationToken cancellationToken)
        {
            return ValueTask.CompletedTask;
        }

        public override async ValueTask OnStepStatusChanged(StepStatus newStatus, StepStatus previousStatus, CancellationToken cancellationToken)
        {
            switch(newStatus)
            {
                case StepStatus.InProgress:
                    await WorkflowManager.UpdateWorkflowStepAsync(CurrentStep.Id, StepStatus.Succeeded, null, cancellationToken);
                    break;
                case StepStatus.Succeeded:
                    // TODO: Get or create next step
                    break;
            }
        }
    }
}

using Newtonsoft.Json.Linq;
using Pomelo.Workflow.Models;

namespace Pomelo.Workflow.WorkflowHandler
{
    public abstract class ProcessWorkflowBase : WorkflowHandlerBase
    {
        public ProcessWorkflowBase(WorkflowManager workflowManager, Step step) : base(workflowManager, step) 
        { }

        public override async ValueTask OnPreviousStepFinishedAsync(
            Step previousStep, 
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

        public override async ValueTask OnStepStatusChangedAsync(StepStatus newStatus, StepStatus previousStatus, CancellationToken cancellationToken)
        {
            switch(newStatus)
            {
                case StepStatus.InProgress:
                    await WorkflowManager.UpdateWorkflowStepAsync(CurrentStep.Id, StepStatus.Succeeded, null, null, cancellationToken);
                    break;
                case StepStatus.Succeeded:
                    break;
            }
        }
    }
}

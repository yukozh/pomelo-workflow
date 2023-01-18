using Pomelo.Workflow.Models;

namespace Pomelo.Workflow.WorkflowHandler
{
    public abstract class WorkflowHandlerBase
    {
        protected readonly WorkflowManager WorkflowManager;
        protected readonly Step CurrentStep;

        public WorkflowHandlerBase(WorkflowManager workflowManager, Step step)
        {
            WorkflowManager = workflowManager;
            CurrentStep = step;
        }

        public abstract ValueTask OnStepStatusChanged(StepStatus newStatus, StepStatus previousStatus, CancellationToken cancellationToken);

        public abstract ValueTask OnPreviousStepFinishedAsync(Step previousStep, CancellationToken cancellationToken);
    }
}

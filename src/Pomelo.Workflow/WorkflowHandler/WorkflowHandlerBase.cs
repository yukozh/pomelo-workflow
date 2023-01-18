using Newtonsoft.Json.Linq;
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

        public abstract ValueTask OnStepStatusChangedAsync(StepStatus newStatus, StepStatus previousStatus, CancellationToken cancellationToken);

        public abstract ValueTask OnPreviousStepFinishedAsync(Step previousStep, bool allPreviousStepsFinished, CancellationToken cancellationToken);

        public static ValueTask<bool> IsAbleToConnectToCurrentStepAsync(
            string connectType,
            Dictionary<string, JToken> connectArguments,
            Shape shape,
            Step previousStep,
            CancellationToken cancellationToken = default)
        {
            return ValueTask.FromResult(false);
        }
    }
}

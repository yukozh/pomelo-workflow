namespace Pomelo.Workflow.Models.ViewModels
{
    public class UpdateWorkflowStepResult
    {
        public StepStatus NewStatus { get; set; }

        public StepStatus PreviousStatus { get; set; }
    }
}

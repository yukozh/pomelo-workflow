namespace Pomelo.Workflow.Models.ViewModels
{
    public class UpdateWorkflowInstanceResult
    {
        public WorkflowStatus NewStatus { get; set; }

        public WorkflowStatus OldStatus { get; set; }
    }
}

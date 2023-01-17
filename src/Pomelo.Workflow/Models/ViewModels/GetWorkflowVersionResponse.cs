namespace Pomelo.Workflow.Models.ViewModels
{
    public class GetWorkflowVersionResponse
    {
        public Guid WorkflowId { get; set; }

        public int Version { get; set; }

        public Diagram Diagram { get; set; }
    }
}

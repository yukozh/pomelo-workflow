namespace Pomelo.Workflow.Models
{
    public class WorkflowVersion
    {
        public Guid WorkflowId { get; set; }

        public int Version { get; set; }

        public Diagram Diagram { get; set; }
    }
}

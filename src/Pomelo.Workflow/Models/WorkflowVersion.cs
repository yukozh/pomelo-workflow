namespace Pomelo.Workflow.Models
{
    public enum WorkflowVersionStatus
    {
        Draft,
        Available,
        Disabled
    }

    public class WorkflowVersion
    {
        public Guid WorkflowId { get; set; }

        public int Version { get; set; }

        public Diagram Diagram { get; set; }

        public WorkflowVersionStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

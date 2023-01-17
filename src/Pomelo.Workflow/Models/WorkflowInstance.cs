using Newtonsoft.Json.Linq;

namespace Pomelo.Workflow.Models
{
    public enum WorkflowStatus
    {
        NotStarted,
        InProgress,
        Finished
    }

    public class WorkflowInstance
    {
        public Guid Id { get; set; }

        public Guid WorkflowId { get; set; }

        public int WorkflowVersion { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public WorkflowStatus Status { get; set; }

        public Dictionary<string, JToken> Arguments { get; set; }
    }
}

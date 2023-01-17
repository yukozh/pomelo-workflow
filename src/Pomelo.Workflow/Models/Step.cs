using Newtonsoft.Json.Linq;

namespace Pomelo.Workflow.Models
{
    public enum StepStatus
    {
        NotStarted,
        InProgress,
        Failed,
        Succeeded
    }

    public class Step
    {
        public Guid Id { get; set; }

        public Guid WorkflowInstanceId { get; set; }

        public string Type { get; set; }

        public int Order { get; set; }

        public StepStatus Status { get; set; }

        public JToken Arguments { get; set; }

        public string Error { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

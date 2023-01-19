namespace Pomelo.Workflow.Models.ViewModels
{
    public class InstanceShape : Shape
    {
        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public StepStatus Status { get; set; }
    }
}

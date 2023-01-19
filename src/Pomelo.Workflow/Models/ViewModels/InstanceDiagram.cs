namespace Pomelo.Workflow.Models.ViewModels
{
    public class InstanceDiagram : Diagram
    {
        public WorkflowStatus Status { get; set; }

        public new IEnumerable<InstanceShape> Shapes { get; set; }
    }
}

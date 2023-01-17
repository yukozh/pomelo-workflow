namespace Pomelo.Workflow.Models.EntityFramework
{
    public class DbStep : Step
    {
        public virtual DbWorkflowInstance WorkflowInstance { get; set; }
    }
}

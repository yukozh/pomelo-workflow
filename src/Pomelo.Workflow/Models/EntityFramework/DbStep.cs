namespace Pomelo.Workflow.Models.EntityFramework
{
    public class DbStep : WorkflowInstanceStep
    {
        public virtual DbWorkflowInstance WorkflowInstance { get; set; }
    }
}

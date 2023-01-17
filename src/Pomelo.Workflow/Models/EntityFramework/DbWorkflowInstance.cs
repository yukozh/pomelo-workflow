namespace Pomelo.Workflow.Models.EntityFramework
{
    public class DbWorkflowInstance : WorkflowInstance
    {
        public virtual DbWorkflow Workflow { get; set; }

        public virtual ICollection<DbStep> Steps { get; set; }
    }
}

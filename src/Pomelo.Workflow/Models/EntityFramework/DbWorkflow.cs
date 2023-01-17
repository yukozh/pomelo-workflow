namespace Pomelo.Workflow.Models.EntityFramework
{
    public class DbWorkflow : Workflow
    {
        public virtual ICollection<DbWorkflowVersion> Versions { get; set; }

        public virtual ICollection<DbWorkflowInstance> Instances { get; set; }
    }
}

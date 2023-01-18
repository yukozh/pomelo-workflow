namespace Pomelo.Workflow
{
    public class WorkflowHandlerAttribute : Attribute
    {
        public string Type { get; init; }

        public WorkflowHandlerAttribute(string type)
        {
            Type = type;
        }
    }
}

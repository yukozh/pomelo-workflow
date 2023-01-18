namespace Pomelo.Workflow.Models.ViewModels
{
    public class GetPreviousStepsResult
    {
        public IEnumerable<Step> Steps { get; set; }

        public IEnumerable<Guid> ShapeIds { get; set; }
    }
}

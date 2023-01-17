namespace Pomelo.Workflow.Models
{
    public class Diagram
    {
        public Guid Guid { get; set; }

        public IEnumerable<Shape> Shapes { get; set; }

        public IEnumerable<ConnectPolyline> ConnectPolylines { get; set; }

        public string Version { get; set; }
    }
}

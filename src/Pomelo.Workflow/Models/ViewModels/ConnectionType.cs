using Newtonsoft.Json.Linq;

namespace Pomelo.Workflow.Models.ViewModels
{
    public class ConnectionType
    {
        public string Type { get; set; }

        public Dictionary<string, JToken> Arguments { get; set; }
    }
}

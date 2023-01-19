// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Pomelo.Workflow.Models
{
    public class Diagram
    {
        [JsonProperty(PropertyName = "guid")]
        public Guid Guid { get; set; }

        [JsonProperty(PropertyName = "shapes")]
        public IEnumerable<JToken> Shapes { get; set; }

        [JsonProperty(PropertyName = "connectPolylines")]
        public IEnumerable<ConnectPolyline> ConnectPolylines { get; set; }

        [JsonProperty(PropertyName = "version")]
        public string Version { get; set; }
    }
}

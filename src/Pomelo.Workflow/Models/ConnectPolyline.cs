// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Pomelo.Workflow.Models
{
    public class ConnectPolyline
    {
        [JsonProperty(PropertyName = "guid")]
        public Guid Guid { get; set; }

        [JsonProperty(PropertyName = "departureShapeGuid")]
        public Guid DepartureShapeGuid { get; set; }

        [JsonProperty(PropertyName = "destinationShapeGuid")]
        public Guid DestinationShapeGuid { get; set; }

        [JsonProperty(PropertyName = "departureAnchorIndex")]
        public int DepartureAnchorIndex { get; set; }

        [JsonProperty(PropertyName = "destinationAnchorIndex")]
        public int DestinationAnchorIndex { get; set; }

        [JsonProperty(PropertyName = "path")]
        public IEnumerable<Point> Path { get; set; }

        [JsonProperty(PropertyName = "color")]
        public string Color { get; set; }

        [JsonProperty(PropertyName = "dashed")]
        public bool Dashed { get; set; }

        [JsonProperty(PropertyName = "type")]
        public string Type { get; set; }

        [JsonProperty(PropertyName = "arguments")]
        public Dictionary<string, JToken> Arguments { get; set; }
    }
}

// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Pomelo.Workflow.Models
{
    public class Shape
    {
        [JsonProperty(PropertyName = "guid")]
        public Guid Guid { get; set; }

        [JsonProperty(PropertyName = "type")]
        public virtual string Type { get; set; } = "Shape";

        [JsonProperty(PropertyName = "points")]
        public IEnumerable<Point> Points { get; set; }

        [JsonProperty(PropertyName = "anchors")]
        public IEnumerable<Anchor> Anchors { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "node")]
        public string Node { get; set; }

        [JsonProperty(PropertyName = "arguments")]
        public Dictionary<string, JToken> Arguments { get; set; }
    }

    public class Rectangle : Shape
    {
        public override string Type { get; set; } = "Rectangle";

        [JsonProperty(PropertyName = "width")]
        public int Width { get; set; }

        [JsonProperty(PropertyName = "height")]
        public int Height { get; set; }
    }
}

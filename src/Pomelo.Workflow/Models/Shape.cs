// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Newtonsoft.Json.Linq;

namespace Pomelo.Workflow.Models
{
    public class Shape
    {
        public Guid Guid { get; set; }

        public virtual string Type { get; set; } = "Shape";

        public IEnumerable<Point> Points { get; set; }

        public IEnumerable<Anchor> Anchors { get; set; }

        public string Name { get; set; }

        public string Node { get; set; }

        public Dictionary<string, JToken> Arguments { get; set; }
    }

    public class Rectangle : Shape 
    {
        public override string Type { get; set; } = "Rectangle";

        public int Width { get; set; }

        public int Height { get; set; }
    }
}

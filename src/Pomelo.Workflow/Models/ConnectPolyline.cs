﻿// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Newtonsoft.Json.Linq;

namespace Pomelo.Workflow.Models
{
    public class ConnectPolyline
    {
        public Guid Guid { get; set; }

        public Guid DepartureShapeGuid { get; set; }

        public Guid DestinationShapeGuid { get; set; }

        public int DestinationAnchorIndex { get; set; }

        public IEnumerable<Point> Points { get; set; } 

        public string Color { get; set; }

        public bool Dashed { get; set; }

        public string Type { get; set; }

        public Dictionary<string, JToken> Arguments { get; set; }
    }
}

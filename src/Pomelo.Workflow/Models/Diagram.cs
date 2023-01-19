// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

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

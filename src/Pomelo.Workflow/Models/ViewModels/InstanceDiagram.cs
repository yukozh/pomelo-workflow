// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Pomelo.Workflow.Models.ViewModels
{
    public class InstanceDiagram : Diagram
    {
        [JsonProperty(PropertyName = "instanceId")]
        public Guid InstanceId { get; set; }

        [JsonProperty(PropertyName = "status")]
        public WorkflowStatus Status { get; set; }

        [JsonProperty(PropertyName = "shapes")]
        public new IEnumerable<InstanceShape> Shapes { get; set; }
    }
}

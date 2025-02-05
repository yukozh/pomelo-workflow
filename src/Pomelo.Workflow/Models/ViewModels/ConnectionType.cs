// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Pomelo.Workflow.Models.ViewModels
{
    public class ConnectionType
    {
        public string Type { get; set; }

        public Dictionary<string, JToken> ConnectionArguments { get; set; }
    }

    public class ConnectionTypeWithDeparture : ConnectionType
    { 
        public Guid DepartureShapeGuid { get; set; }

        public Shape DepartureShape { get; set; }

        public Guid? DepartureStepId { get; set; }

        public WorkflowInstanceStep DepartureStep { get; set; } 
    }
}

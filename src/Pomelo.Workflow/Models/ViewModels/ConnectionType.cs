// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Newtonsoft.Json.Linq;

namespace Pomelo.Workflow.Models.ViewModels
{
    public class ConnectionType
    {
        public string Type { get; set; }

        public Dictionary<string, JToken> Arguments { get; set; }
    }
}

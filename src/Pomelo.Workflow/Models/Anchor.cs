// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Newtonsoft.Json;

namespace Pomelo.Workflow.Models
{
    public class Anchor
    {
        [JsonProperty(PropertyName = "xPercentage")]
        public double XPercentage { get; set; }

        [JsonProperty(PropertyName = "yPercentage")]
        public double YPercentage { get; set; }
    }
}

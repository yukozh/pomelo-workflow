// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json;

namespace Pomelo.Workflow.Models.ViewModels
{
    public class InstanceRectangle : InstanceShape
    {
        public override string Type { get => "Rectangle"; set => base.Type = "Rectangle"; }

        [JsonProperty(PropertyName = "width")]
        public int Width { get; set; }

        [JsonProperty(PropertyName = "height")]
        public int Height { get; set; }
    }
}

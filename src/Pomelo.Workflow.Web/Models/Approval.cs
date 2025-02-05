using Pomelo.Workflow.Models.EntityFramework;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pomelo.Workflow.Web.Models
{
    public enum ApprovalStatus
    { 
        Pending,
        Approved,
        Rejected
    }

    public class Approval
    {
        public Guid Id { get; set; }

        [MaxLength(32)]
        public string Title { get; set; }

        public ApprovalStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(Step))]
        public Guid StepId { get; set; }

        public virtual DbStep Step { get; set; }
    }
}

using Dribbly.Web.Enums;
using System;

namespace Dribbly.Web.Models
{
    public class IndexedEntityModel
    {
        public long Id { get; set; }

        public EntityTypeEnum EntityType { get; set; }
        public string Name { get; set; }

        public string IconUrl { get; set; }

        public string Description { get; set; }

        public DateTime DateAdded { get; set; }
        public string AdditionalData { get; set; }
    }
}

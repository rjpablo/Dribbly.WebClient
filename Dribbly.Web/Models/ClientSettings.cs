namespace Dribbly.Web.Models
{
    public class ClientSettings
    {
        public string LoggingServiceAddress { get; set; }
        public string ServiceBase { get; set; }
        public bool SuppressNotifications { get; set; }
        public bool AllowGameReset { get; set; }
        public string ChatHubName { get; set; }
        public string NotificationsHubName { get; set; }
        public string SiteName { get; set; }
        public string SiteDescription { get; set; }
        public string SiteSharedImageUrl { get; set; }
        public string SiteLogoUrl { get; set; }
        public string TagLine { get; set; }
    }
}

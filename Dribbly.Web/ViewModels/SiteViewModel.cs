using Dribbly.Web.Models;

namespace Dribbly.Web.ViewModels
{
    public class SiteViewModel : BaseViewModel
    {
        public string Module { get; set; }
        public string Controller { get; set; }
        public bool UsesNavigationBar { get; set; } = true;
        public ClientSettings clientSettings { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }

        public SiteViewModel(string module, ClientSettings clientSettings, string title = "", string imageUrl = null, string description = null) : base()
        {
            Module = module;
            Controller = module.Replace("Module", "Controller");
            this.clientSettings = clientSettings;
            Title = string.IsNullOrEmpty(title) ?
                clientSettings.DefaultSiteTitle :
                ($"{title} - {clientSettings.SiteName}");
            ImageUrl = imageUrl ?? clientSettings.SiteSharedImageUrl;
            Description = description ?? clientSettings.SiteDescription;
        }
    }
}

using Dribbly.Web.Models;

namespace Dribbly.Web.ViewModels
{
    public class SiteViewModel : BaseViewModel
    {
        public string Module { get; set; }
        public string Controller { get; set; }
        public bool UsesNavigationBar { get; set; } = true;
        public ClientSettings clientSettings { get; set; }

        public SiteViewModel(string module, ClientSettings clientSettings) : base()
        {
            Module = module;
            Controller = module.Replace("Module", "Controller");
            this.clientSettings = clientSettings;
        }
    }
}

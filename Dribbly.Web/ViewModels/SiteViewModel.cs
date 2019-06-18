namespace Dribbly.Web.ViewModels
{
    public class SiteViewModel : BaseViewModel
    {
        public string Module { get; set; }
        public string Controller { get; set; }
        public bool UsesNavigationBar { get; set; } = true;

        public SiteViewModel(string module) : base()
        {
            Module = module;
            Controller = module.Replace("Module", "Controller");
        }
    }
}

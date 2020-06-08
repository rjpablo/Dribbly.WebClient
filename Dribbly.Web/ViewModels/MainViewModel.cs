using Dribbly.Web.Models;

namespace Dribbly.Web.ViewModels
{
    public class MainViewModel : SiteViewModel
    {

        public MainViewModel(ClientSettings clientSettings) : base("mainModule", clientSettings)
        {

        }
    }
}

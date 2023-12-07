using Dribbly.Web.Models;

namespace Dribbly.Web.ViewModels
{
    public class MainViewModel : SiteViewModel
    {

        public MainViewModel(ClientSettings clientSettings, string title = "", string imageUrl = "", string description = "") : base("mainModule", clientSettings, title, imageUrl, description)
        {

        }
    }
}

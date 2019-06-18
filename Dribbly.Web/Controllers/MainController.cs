using Dribbly.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Dribbly.Web.Controllers
{
    public class MainController : Controller
    {
        public IActionResult Index()
        {
            return View(new MainViewModel());
        }
    }
}
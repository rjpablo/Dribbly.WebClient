using Dribbly.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Dribbly.Web.Controllers
{
    public class CourtsController : Controller
    {
        public IActionResult Index()
        {
            return View(new CourtsViewModel());
        }
    }
}
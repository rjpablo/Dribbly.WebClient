using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dribbly.Web.Models;
using Dribbly.Web.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Dribbly.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            //services.Configure<CookiePolicyOptions>(options =>
            //{
            //    // This lambda determines whether user consent for non-essential cookies is needed for a given request.
            //    options.CheckConsentNeeded = context => true;
            //    options.MinimumSameSitePolicy = SameSiteMode.None;
            //});

            var ClientSettingsSection =
                Configuration.GetSection("ClientSettings");
            services.Configure<ClientSettings>(ClientSettingsSection);

            services.AddScoped<IHttpService, HttpService>();

            services.AddMvc(options => options.EnableEndpointRouting = false);
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential 
                // cookies is needed for a given request.
                options.CheckConsentNeeded = context => ClientSettingsSection.GetValue<bool>("RequestCookieConsent");
                // requires using Microsoft.AspNetCore.Http;
                options.MinimumSameSitePolicy = SameSiteMode.Lax;
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();

            app.UseMvc(routes =>
            {
                // Set Main/Index as the default route
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Main}/{action=Index}/{id?}");

                #region Account
                routes.MapRoute(
                    name: "account",
                    template: "account/{username}/{path?}",
                    defaults: new
                    {
                        controller = "Account",
                        Action = "Index",
                    });
                #endregion

                #region Blog
                routes.MapRoute(
                    name: "blog",
                    template: "blog/{slug}",
                    defaults: new
                    {
                        controller = "Blog",
                        Action = "Index",
                    });
                #endregion

                #region Game
                routes.MapRoute(
                    name: "court games",
                    template: "court/{courtId}/games",
                    defaults: new
                    {
                        controller = "Court",
                        Action = "Games",
                    });
                
                routes.MapRoute(
                    name: "court photos",
                    template: "court/{courtId}/photos",
                    defaults: new
                    {
                        controller = "Court",
                        Action = "Photos",
                    });
                
                routes.MapRoute(
                    name: "court videos",
                    template: "court/{courtId}/videos",
                    defaults: new
                    {
                        controller = "Court",
                        Action = "Videos",
                    });

                routes.MapRoute(
                    name: "court details",
                    template: "court/{courtId}/details",
                    defaults: new
                    {
                        controller = "Court",
                        Action = "Details",
                    });

                routes.MapRoute(
                    name: "court",
                    template: "court/{courtId}",
                    defaults: new
                    {
                        controller = "Court",
                        Action = "Index",
                    });
                #endregion

                // Reroute all requests to Main/Index
                // Required 
                routes.MapRoute(
                    name: "all",
                    template: "{*url}",
                    defaults: new
                    {
                        controller = "Main",
                        Action= "Index",
                    });
            });
        }
    }
}

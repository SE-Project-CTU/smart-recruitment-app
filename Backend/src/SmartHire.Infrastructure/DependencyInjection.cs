using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Infrastructure.Persistence;
using SmartHire.Infrastructure.Persistence.Repositories;
using SmartHire.Infrastructure.Security;

namespace SmartHire.Infrastructure;

public static class DependencyInjection {
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration) {
        var connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' was not configured.");
        
        services.AddDbContext<SmartHireDbContext>(options =>
            options.UseNpgsql(
                    connectionString,
                    npgsql => {
                        npgsql.UseVector();
                        npgsql.MigrationsAssembly("SmartHire.Infrastructure");
                    })
                .UseSnakeCaseNamingConvention()
        );
        
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IPasswordHasher, AspNetPasswordHasher>();
        services.AddScoped<IUnitOfWork, EfUnitOfWork>();
        
        return services;
    }
}
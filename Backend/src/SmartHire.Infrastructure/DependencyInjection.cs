using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Abstractions.Storage;
using SmartHire.Infrastructure.Persistence;
using SmartHire.Infrastructure.Persistence.Repositories;
using SmartHire.Infrastructure.Security;
using SmartHire.Infrastructure.Storage;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

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
        
        services.AddSingleton<IAccessTokenGenerator, JwtAccessTokenGenerator>();
        
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddSingleton<IRefreshTokenGenerator, RefreshTokenGenerator>();
        
        services.AddScoped<IMediaFileRepository, MediaFileRepository>();

        // --- Cloudinary ---
        services.Configure<CloudinaryOptions>(configuration.GetSection(CloudinaryOptions.SectionName));

        services.AddScoped<IFileStorageService, CloudinaryFileStorageService>();
        
        return services;
    }
}

    
    public static IServiceCollection AddJwtBearerAuthentication(
        this IServiceCollection services,
        IConfiguration configuration) {
        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer();
        
        // Configure the validator from the same validated options used to issue tokens.
        services
            .AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<JwtOptions>>((options, jwtOptionsAccessor) => {
                var jwt = jwtOptionsAccessor.Value;
                var keyBytes = Encoding.UTF8.GetBytes(jwt.SigningKey);
                
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters {
                    ValidateIssuer = true,
                    ValidIssuer = jwt.Issuer,
                    
                    ValidateAudience = true,
                    ValidAudience = jwt.Audience,
                    
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                    
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    
                    NameClaimType = JwtRegisteredClaimNames.Name,
                    RoleClaimType = "role"
                };
            });
        
        services.AddAuthorization();
        
        
        return services;
    }
}

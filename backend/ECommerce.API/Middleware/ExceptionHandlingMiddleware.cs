using System.Net;
using System.Text.Json;
using ECommerce.Core.DTOs.Response.Common;
using ECommerce.Core.Exceptions;

namespace ECommerce.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var code = HttpStatusCode.InternalServerError;
        var message = "An error occurred while processing your request.";

        switch (exception)
        {
            case NotFoundException:
                code = HttpStatusCode.NotFound;
                message = exception.Message;
                break;
            case BadRequestException:
                code = HttpStatusCode.BadRequest;
                message = exception.Message;
                break;
            case UnauthorizedException:
                code = HttpStatusCode.Unauthorized;
                message = exception.Message;
                break;
            case ValidationException validationException:
                code = HttpStatusCode.BadRequest;
                message = validationException.Message;
                var response = ApiResponse<object>.ErrorResponse(message, validationException.Errors);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)code;
                return context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }

        var errorResponse = ApiResponse<object>.ErrorResponse(message);
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;
        return context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
    }
}


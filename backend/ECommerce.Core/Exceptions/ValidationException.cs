namespace ECommerce.Core.Exceptions;

public class ValidationException : Exception
{
    public List<string> Errors { get; set; } = new();

    public ValidationException(string message) : base(message)
    {
    }

    public ValidationException(List<string> errors) : base("Validation failed")
    {
        Errors = errors;
    }
}


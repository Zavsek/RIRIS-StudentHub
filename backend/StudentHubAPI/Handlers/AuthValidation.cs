using System.Text;
using StudentHubAPI.Models;

namespace StudentHubAPI.Handlers;

internal static class AuthValidation
{
    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    public static string? RegistrationError(RegisterRequest request)
    {
        var emailError = EmailError(request.Email);
        if (emailError is not null)
        {
            return emailError;
        }

        var passwordError = PasswordError(request.Password);
        if (passwordError is not null)
        {
            return passwordError;
        }

        return NameError(request.Name);
    }

    private static string? EmailError(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return "E-pošta je obvezna.";
        }

        var normalized = NormalizeEmail(email);
        var parts = normalized.Split('@');
        var domain = parts.Length == 2 ? parts[1] : "";
        var valid = parts.Length == 2
            && parts[0].Length > 0
            && domain.Contains('.')
            && !domain.StartsWith('.')
            && !domain.EndsWith('.')
            && normalized.Length <= 254;
        return valid ? null : "E-pošta ni veljavna.";
    }

    private static string? PasswordError(string? password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
        {
            return "Geslo mora imeti vsaj 8 znakov.";
        }

        if (Encoding.UTF8.GetByteCount(password) > 72)
        {
            return "Geslo je predolgo.";
        }

        if (!password.Any(char.IsLetter) || !password.Any(char.IsDigit))
        {
            return "Geslo mora vsebovati črko in številko.";
        }

        return null;
    }

    private static string? NameError(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return "Ime je obvezno.";
        }

        var trimmed = name.Trim();
        return trimmed.Length is >= 2 and <= 80 ? null : "Ime mora imeti od 2 do 80 znakov.";
    }
}

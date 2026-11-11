using System.Data;
using Dapper;

namespace StudentHubAPI.Data;

public sealed class TimeOnlyHandler : SqlMapper.TypeHandler<TimeOnly>
{
    public override void SetValue(IDbDataParameter parameter, TimeOnly value)
    {
        parameter.Value = value;
    }

    public override TimeOnly Parse(object value) => value switch
    {
        TimeOnly timeOnly => timeOnly,
        TimeSpan timeSpan => TimeOnly.FromTimeSpan(timeSpan),
        DateTime dateTime => TimeOnly.FromDateTime(dateTime),
        string str => TimeOnly.Parse(str),
        _ => default
    };
}

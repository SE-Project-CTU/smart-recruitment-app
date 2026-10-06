using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Json;

public static class JsonbPropertyBuilderExtensions {
    public static PropertyBuilder<CvLanguage> HasCvLanguageCodeConversion(
        this PropertyBuilder<CvLanguage> propertyBuilder) {
        var converter = new ValueConverter<CvLanguage, string>(
            language => CvLanguageCodes.ToCode(language),
            code => CvLanguageCodes.FromCode(code)
        );
        
        return propertyBuilder
            .HasConversion(converter)
            .HasMaxLength(2)
            .IsRequired();
    }
    
    public static PropertyBuilder<TDocument> HasJsonbDocumentConversion<TDocument>(
        this PropertyBuilder<TDocument> propertyBuilder)
        where TDocument : class {
        var converter = new ValueConverter<TDocument, string>(
            document => CvJsonSerializer.Serialize(document),
            json => CvJsonSerializer.Deserialize<TDocument>(json));
        
        var comparer = new ValueComparer<TDocument>(
            (left, right) => CvJsonSerializer.Serialize(left!) == CvJsonSerializer.Serialize(right!),
            value => CvJsonSerializer.Serialize(value!).GetHashCode(),
            value => CvJsonSerializer.Deserialize<TDocument>(CvJsonSerializer.Serialize(value!)));
        
        propertyBuilder
            .HasConversion(converter)
            .HasColumnType("jsonb")
            .IsRequired()
            .Metadata.SetValueComparer(comparer);
        
        return propertyBuilder;
    }
}
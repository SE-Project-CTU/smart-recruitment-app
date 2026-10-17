using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartHire.Api.Contracts.Requests;

public sealed class CreateCompanyRequest {
    public string Name { get; init; } = string.Empty;
    public string TaxCode { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string? Address { get; init; }
    public string? Website { get; init; }
    public string? Description { get; init; }
    public Guid? LogoFileId { get; init; }
    public string? LogoUrl { get; init; }
}

public sealed class UpdateCompanyRequest {
    private string? _name;
    private string? _email;
    private string? _phone;
    private string? _address;
    private string? _website;
    private string? _description;
    private Guid? _logoFileId;
    private string? _logoUrl;

    public string? Name {
        get => _name;
        init {
            _name = value;
            NameProvided = true;
        }
    }
    [JsonIgnore] public bool NameProvided { get; private set; }

    public string? Email {
        get => _email;
        init {
            _email = value;
            EmailProvided = true;
        }
    }
    [JsonIgnore] public bool EmailProvided { get; private set; }

    public string? Phone {
        get => _phone;
        init {
            _phone = value;
            PhoneProvided = true;
        }
    }
    [JsonIgnore] public bool PhoneProvided { get; private set; }

    public string? Address {
        get => _address;
        init {
            _address = value;
            AddressProvided = true;
        }
    }
    [JsonIgnore] public bool AddressProvided { get; private set; }

    public string? Website {
        get => _website;
        init {
            _website = value;
            WebsiteProvided = true;
        }
    }
    [JsonIgnore] public bool WebsiteProvided { get; private set; }

    public string? Description {
        get => _description;
        init {
            _description = value;
            DescriptionProvided = true;
        }
    }
    [JsonIgnore] public bool DescriptionProvided { get; private set; }

    public Guid? LogoFileId {
        get => _logoFileId;
        init {
            _logoFileId = value;
            LogoFileIdProvided = true;
        }
    }
    [JsonIgnore] public bool LogoFileIdProvided { get; private set; }

    public string? LogoUrl {
        get => _logoUrl;
        init {
            _logoUrl = value;
            LogoUrlProvided = true;
        }
    }
    [JsonIgnore] public bool LogoUrlProvided { get; private set; }

    [JsonExtensionData] public Dictionary<string, JsonElement>? AdditionalFields { get; init; }
}

public sealed class InviteRecruiterRequest {
    public Guid InviteeId { get; init; }
    public DateTimeOffset? ExpiresAt { get; init; }
}

public sealed class SubmitJoinRequestRequest {
    public string? Message { get; init; }
}

public sealed class ReviewJoinRequestRequest {
    public string Status { get; init; } = string.Empty;
}

public sealed class TransferOwnershipRequest {
    public Guid NewOwnerId { get; init; }
}

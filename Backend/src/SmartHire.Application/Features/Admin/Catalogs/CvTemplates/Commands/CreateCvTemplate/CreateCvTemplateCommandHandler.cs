using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;
using DomainCvTemplate = SmartHire.Domain.Entities.CvTemplate;

namespace SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Commands.CreateCvTemplate;

public sealed class CreateCvTemplateCommandHandler
    : IRequestHandler<CreateCvTemplateCommand, AdminCvTemplateDetailDto> {
    private readonly ICvTemplateRepository _repository;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCvTemplateCommandHandler(
        ICvTemplateRepository repository,
        IMediaFileRepository mediaFileRepository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _mediaFileRepository = mediaFileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminCvTemplateDetailDto> Handle(
        CreateCvTemplateCommand request,
        CancellationToken cancellationToken) {
        var command = CreateCvTemplateCommandValidator.Validate(request);

        var exists = await _repository.CodeExistsAsync(command.Code, null, cancellationToken);
        if (exists) {
            throw AdminExceptions.Conflict(
                AdminErrorCodes.CvTemplateCodeAlreadyExists,
                $"CV template code '{command.Code}' already exists.",
                "code");
        }

        var media = await _mediaFileRepository.GetByIdAsync(command.ThumbnailFileId, cancellationToken);
        if (media is null) {
            throw AdminExceptions.Validation("Thumbnail media file not found.", [
                new AppErrorDetail("thumbnailFileId", ErrorDetailReasons.NotFound, $"Media file with ID '{command.ThumbnailFileId}' does not exist.")
            ]);
        }

        var now = DateTimeOffset.UtcNow;
        var template = DomainCvTemplate.Create(
            command.Code,
            command.Name,
            command.Description,
            command.ThumbnailFileId,
            command.Version ?? "1",
            command.DefaultLayout,
            command.DefaultContent,
            command.Language,
            now);

        await _repository.AddCvTemplateAsync(template, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AdminCvTemplateDetailDto(
            template.Id,
            template.Code,
            template.Name,
            template.Description,
            template.ThumbnailFileId,
            media.FileUrl,
            template.Version,
            template.DefaultLayout,
            template.DefaultContent,
            template.Language.ToString().ToUpperInvariant(),
            template.IsActive,
            template.CreatedAt,
            template.UpdatedAt);
    }
}

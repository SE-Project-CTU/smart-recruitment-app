using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Commands.UpdateCvTemplate;

public sealed class UpdateCvTemplateCommandHandler
    : IRequestHandler<UpdateCvTemplateCommand, AdminCvTemplateDetailDto> {
    private readonly ICvTemplateRepository _repository;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCvTemplateCommandHandler(
        ICvTemplateRepository repository,
        IMediaFileRepository mediaFileRepository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _mediaFileRepository = mediaFileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminCvTemplateDetailDto> Handle(
        UpdateCvTemplateCommand request,
        CancellationToken cancellationToken) {
        var command = UpdateCvTemplateCommandValidator.Validate(request);

        var template = await _repository.GetAdminCvTemplateByIdAsync(command.Id, cancellationToken);
        if (template is null) {
            throw AdminExceptions.CvTemplateNotFound(command.Id);
        }

        string? thumbnailUrl = template.ThumbnailFile?.FileUrl;

        if (command.ThumbnailFileId.HasValue && command.ThumbnailFileId.Value != template.ThumbnailFileId) {
            var media = await _mediaFileRepository.GetByIdAsync(command.ThumbnailFileId.Value, cancellationToken);
            if (media is null) {
                throw AdminExceptions.Validation("Thumbnail media file not found.", [
                    new AppErrorDetail("thumbnailFileId", ErrorDetailReasons.NotFound, $"Media file with ID '{command.ThumbnailFileId.Value}' does not exist.")
                ]);
            }
            thumbnailUrl = media.FileUrl;
        }

        var now = DateTimeOffset.UtcNow;

        // Soft Hide logic: when IsActive is set to false, it is safely toggled without deleting data
        template.Update(
            command.Name,
            command.Description,
            command.ThumbnailFileId,
            command.Version,
            command.DefaultLayout,
            command.DefaultContent,
            command.IsActive,
            now);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AdminCvTemplateDetailDto(
            template.Id,
            template.Code,
            template.Name,
            template.Description,
            template.ThumbnailFileId,
            thumbnailUrl,
            template.Version,
            template.DefaultLayout,
            template.DefaultContent,
            template.Language.ToString().ToUpperInvariant(),
            template.IsActive,
            template.CreatedAt,
            template.UpdatedAt);
    }
}


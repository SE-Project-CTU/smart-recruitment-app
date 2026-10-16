using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Storage;

namespace SmartHire.Application.Features.Media.Jobs.DeleteMediaFile;

public sealed class DeleteMediaFileJob : IBackgroundJob<DeleteMediaFileJobArgs> {
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    
    public DeleteMediaFileJob(IMediaFileRepository mediaFileRepository, IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork) {
        _mediaFileRepository = mediaFileRepository;
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
    }
    
    public async Task ExecuteAsync(DeleteMediaFileJobArgs args, CancellationToken cancellationToken) {
        var mediaFile = await _mediaFileRepository.GetByIdAsync(args.MediaFileId, cancellationToken);
        
        if (mediaFile is null) {
            return;
        }
        
        await _fileStorageService.DeleteAsync(mediaFile.PublicId, cancellationToken);
        
        _mediaFileRepository.Delete(mediaFile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
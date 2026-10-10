namespace SmartHire.Application.Common.Validation;

public static class FileSignatureValidator {
    // JPEG / JPG: FF D8 FF
    private static readonly byte[] JpegSignature = [0xFF, 0xD8, 0xFF];

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    private static readonly byte[] PngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

    // PDF: %PDF- (25 50 44 46 2D)
    private static readonly byte[] PdfSignature = [0x25, 0x50, 0x44, 0x46, 0x2D];

    public static bool IsValidImage(Stream stream) {
        if (!stream.CanSeek) {
            return false;
        }

        var initialPosition = stream.Position;
        var header = new byte[16];
        var bytesRead = stream.Read(header, 0, header.Length);
        stream.Position = initialPosition;

        if (bytesRead < 4) {
            return false;
        }

        // Kiểm tra JPEG
        if (header.Take(3).SequenceEqual(JpegSignature)) {
            return true;
        }

        // Kiểm tra PNG
        if (bytesRead >= 8 && header.Take(8).SequenceEqual(PngSignature)) {
            return true;
        }

        // Kiểm tra WEBP
        if (bytesRead >= 12 &&
            header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
            header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50) {
            return true;
        }

        return false;
    }

    public static bool IsValidPdf(Stream stream) {
        if (!stream.CanSeek) {
            return false;
        }

        var initialPosition = stream.Position;
        var header = new byte[8];
        var bytesRead = stream.Read(header, 0, header.Length);
        stream.Position = initialPosition;

        if (bytesRead < 5) {
            return false;
        }

        // Kiểm tra PDF
        return header.Take(5).SequenceEqual(PdfSignature);
    }
}

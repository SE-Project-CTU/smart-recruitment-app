using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MakeCvPreviewFileOneToOne : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_cvs_preview_file_id",
                table: "cvs");

            migrationBuilder.CreateIndex(
                name: "ix_cvs_preview_file_id",
                table: "cvs",
                column: "preview_file_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_cvs_preview_file_id",
                table: "cvs");

            migrationBuilder.CreateIndex(
                name: "ix_cvs_preview_file_id",
                table: "cvs",
                column: "preview_file_id");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPreviewFileIdToCvVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "preview_file_id",
                table: "cv_versions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_cv_versions_preview_file_id",
                table: "cv_versions",
                column: "preview_file_id");

            migrationBuilder.AddForeignKey(
                name: "fk_cv_versions_media_files_preview_file_id",
                table: "cv_versions",
                column: "preview_file_id",
                principalTable: "media_files",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_cv_versions_media_files_preview_file_id",
                table: "cv_versions");

            migrationBuilder.DropIndex(
                name: "ix_cv_versions_preview_file_id",
                table: "cv_versions");

            migrationBuilder.DropColumn(
                name: "preview_file_id",
                table: "cv_versions");
        }
    }
}

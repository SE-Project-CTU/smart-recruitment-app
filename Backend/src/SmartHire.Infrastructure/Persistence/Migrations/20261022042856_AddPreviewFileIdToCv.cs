using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPreviewFileIdToCv : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "preview_file_id",
                table: "cvs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_cvs_preview_file_id",
                table: "cvs",
                column: "preview_file_id");

            migrationBuilder.AddForeignKey(
                name: "fk_cvs_media_files_preview_file_id",
                table: "cvs",
                column: "preview_file_id",
                principalTable: "media_files",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_cvs_media_files_preview_file_id",
                table: "cvs");

            migrationBuilder.DropIndex(
                name: "ix_cvs_preview_file_id",
                table: "cvs");

            migrationBuilder.DropColumn(
                name: "preview_file_id",
                table: "cvs");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCvSchemaToTiptapAndDropPresentation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "presentation",
                table: "cvs");

            migrationBuilder.DropColumn(
                name: "presentation_hash",
                table: "cvs");

            migrationBuilder.DropColumn(
                name: "presentation",
                table: "cv_versions");

            migrationBuilder.DropColumn(
                name: "default_presentation",
                table: "cv_templates");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "presentation",
                table: "cvs",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "presentation_hash",
                table: "cvs",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "presentation",
                table: "cv_versions",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "default_presentation",
                table: "cv_templates",
                type: "jsonb",
                nullable: false,
                defaultValue: "");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MakeCvVersionPreviewFileUnique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_cv_versions_preview_file_id",
                table: "cv_versions");

            migrationBuilder.Sql(@"
                UPDATE cv_versions
                SET preview_file_id = NULL
                WHERE id IN (
                    SELECT id
                    FROM (
                        SELECT id,
                               ROW_NUMBER() OVER(PARTITION BY preview_file_id ORDER BY created_at DESC, id DESC) as rnum
                        FROM cv_versions
                        WHERE preview_file_id IS NOT NULL
                    ) t
                    WHERE t.rnum > 1
                );
            ");

            migrationBuilder.CreateIndex(
                name: "ix_cv_versions_preview_file_id",
                table: "cv_versions",
                column: "preview_file_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_cv_versions_preview_file_id",
                table: "cv_versions");

            migrationBuilder.CreateIndex(
                name: "ix_cv_versions_preview_file_id",
                table: "cv_versions",
                column: "preview_file_id");
        }
    }
}

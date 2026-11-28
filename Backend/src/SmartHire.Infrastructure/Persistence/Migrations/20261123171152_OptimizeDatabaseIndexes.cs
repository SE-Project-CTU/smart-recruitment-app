using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OptimizeDatabaseIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_job_postings_province_id",
                table: "job_postings");

            migrationBuilder.DropIndex(
                name: "ix_application_status_histories_application_id",
                table: "application_status_histories");

            migrationBuilder.CreateIndex(
                name: "ix_media_files_deleted_at",
                table: "media_files",
                column: "deleted_at",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_job_postings_company_id",
                table: "job_postings",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_job_postings_company_id_status",
                table: "job_postings",
                columns: new[] { "company_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_job_postings_province_id_status",
                table: "job_postings",
                columns: new[] { "province_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_company_memberships_company_id_status",
                table: "company_memberships",
                columns: new[] { "company_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_company_join_requests_company_id_status",
                table: "company_join_requests",
                columns: new[] { "company_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_company_invitations_company_id_status",
                table: "company_invitations",
                columns: new[] { "company_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_applications_job_id_status",
                table: "applications",
                columns: new[] { "job_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_application_status_histories_application_id_created_at",
                table: "application_status_histories",
                columns: new[] { "application_id", "created_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_media_files_deleted_at",
                table: "media_files");

            migrationBuilder.DropIndex(
                name: "ix_job_postings_company_id",
                table: "job_postings");

            migrationBuilder.DropIndex(
                name: "ix_job_postings_company_id_status",
                table: "job_postings");

            migrationBuilder.DropIndex(
                name: "ix_job_postings_province_id_status",
                table: "job_postings");

            migrationBuilder.DropIndex(
                name: "ix_company_memberships_company_id_status",
                table: "company_memberships");

            migrationBuilder.DropIndex(
                name: "ix_company_join_requests_company_id_status",
                table: "company_join_requests");

            migrationBuilder.DropIndex(
                name: "ix_company_invitations_company_id_status",
                table: "company_invitations");

            migrationBuilder.DropIndex(
                name: "ix_applications_job_id_status",
                table: "applications");

            migrationBuilder.DropIndex(
                name: "ix_application_status_histories_application_id_created_at",
                table: "application_status_histories");

            migrationBuilder.CreateIndex(
                name: "ix_job_postings_province_id",
                table: "job_postings",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "ix_application_status_histories_application_id",
                table: "application_status_histories",
                column: "application_id");
        }
    }
}

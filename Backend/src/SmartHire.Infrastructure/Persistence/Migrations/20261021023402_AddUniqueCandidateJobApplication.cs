using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueCandidateJobApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_applications_candidate_id",
                table: "applications");

            migrationBuilder.CreateIndex(
                name: "ix_applications_candidate_id_job_id",
                table: "applications",
                columns: new[] { "candidate_id", "job_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_applications_candidate_id_job_id",
                table: "applications");

            migrationBuilder.CreateIndex(
                name: "ix_applications_candidate_id",
                table: "applications",
                column: "candidate_id");
        }
    }
}

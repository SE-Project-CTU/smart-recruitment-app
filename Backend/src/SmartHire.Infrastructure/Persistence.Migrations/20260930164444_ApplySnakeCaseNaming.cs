using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ApplySnakeCaseNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_JobPosting",
                table: "JobPosting");

            migrationBuilder.RenameTable(
                name: "JobPosting",
                newName: "job_posting");

            migrationBuilder.RenameColumn(
                name: "Vacancies",
                table: "job_posting",
                newName: "vacancies");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "job_posting",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "job_posting",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "job_posting",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "Deadline",
                table: "job_posting",
                newName: "deadline");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "job_posting",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "job_posting",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "SalaryNegotiable",
                table: "job_posting",
                newName: "salary_negotiable");

            migrationBuilder.RenameColumn(
                name: "SalaryMin",
                table: "job_posting",
                newName: "salary_min");

            migrationBuilder.RenameColumn(
                name: "SalaryMax",
                table: "job_posting",
                newName: "salary_max");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "job_posting",
                newName: "created_by");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "job_posting",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "CompanyId",
                table: "job_posting",
                newName: "company_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_job_posting",
                table: "job_posting",
                column: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "pk_job_posting",
                table: "job_posting");

            migrationBuilder.RenameTable(
                name: "job_posting",
                newName: "JobPosting");

            migrationBuilder.RenameColumn(
                name: "vacancies",
                table: "JobPosting",
                newName: "Vacancies");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "JobPosting",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "JobPosting",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "JobPosting",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "deadline",
                table: "JobPosting",
                newName: "Deadline");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "JobPosting",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "JobPosting",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "salary_negotiable",
                table: "JobPosting",
                newName: "SalaryNegotiable");

            migrationBuilder.RenameColumn(
                name: "salary_min",
                table: "JobPosting",
                newName: "SalaryMin");

            migrationBuilder.RenameColumn(
                name: "salary_max",
                table: "JobPosting",
                newName: "SalaryMax");

            migrationBuilder.RenameColumn(
                name: "created_by",
                table: "JobPosting",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "JobPosting",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "company_id",
                table: "JobPosting",
                newName: "CompanyId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_JobPosting",
                table: "JobPosting",
                column: "Id");
        }
    }
}

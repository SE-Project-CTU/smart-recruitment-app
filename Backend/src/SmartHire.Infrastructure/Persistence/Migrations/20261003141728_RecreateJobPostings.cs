using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RecreateJobPostings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_job_skills_job_posting_job_id",
                table: "job_skills");

            migrationBuilder.DropPrimaryKey(
                name: "pk_job_posting",
                table: "job_posting");

            migrationBuilder.RenameTable(
                name: "job_posting",
                newName: "job_postings");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "job_postings",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "benefits",
                table: "job_postings",
                type: "text",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "detailed_location",
                table: "job_postings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "education_level",
                table: "job_postings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "experience_years",
                table: "job_postings",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "job_level",
                table: "job_postings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "job_type",
                table: "job_postings",
                type: "text",
                nullable: false);

            migrationBuilder.AddColumn<Guid>(
                name: "province_id",
                table: "job_postings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "requirements",
                table: "job_postings",
                type: "text",
                nullable: false);

            migrationBuilder.AddColumn<Guid>(
                name: "ward_id",
                table: "job_postings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "work_mode",
                table: "job_postings",
                type: "text",
                nullable: false);

            migrationBuilder.AddPrimaryKey(
                name: "pk_job_postings",
                table: "job_postings",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "ix_job_postings_company_id_created_by",
                table: "job_postings",
                columns: new[] { "company_id", "created_by" });

            migrationBuilder.CreateIndex(
                name: "ix_job_postings_province_id",
                table: "job_postings",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "ix_job_postings_ward_id",
                table: "job_postings",
                column: "ward_id");

            migrationBuilder.AddForeignKey(
                name: "fk_job_postings_companies_company_id",
                table: "job_postings",
                column: "company_id",
                principalTable: "companies",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_job_postings_company_memberships_company_id_created_by",
                table: "job_postings",
                columns: new[] { "company_id", "created_by" },
                principalTable: "company_memberships",
                principalColumns: new[] { "company_id", "user_id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_job_postings_provinces_province_id",
                table: "job_postings",
                column: "province_id",
                principalTable: "provinces",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_job_postings_wards_ward_id",
                table: "job_postings",
                column: "ward_id",
                principalTable: "wards",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_job_skills_job_postings_job_id",
                table: "job_skills",
                column: "job_id",
                principalTable: "job_postings",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_job_postings_companies_company_id",
                table: "job_postings");

            migrationBuilder.DropForeignKey(
                name: "fk_job_postings_company_memberships_company_id_created_by",
                table: "job_postings");

            migrationBuilder.DropForeignKey(
                name: "fk_job_postings_provinces_province_id",
                table: "job_postings");

            migrationBuilder.DropForeignKey(
                name: "fk_job_postings_wards_ward_id",
                table: "job_postings");

            migrationBuilder.DropForeignKey(
                name: "fk_job_skills_job_postings_job_id",
                table: "job_skills");

            migrationBuilder.DropPrimaryKey(
                name: "pk_job_postings",
                table: "job_postings");

            migrationBuilder.DropIndex(
                name: "ix_job_postings_company_id_created_by",
                table: "job_postings");

            migrationBuilder.DropIndex(
                name: "ix_job_postings_province_id",
                table: "job_postings");

            migrationBuilder.DropIndex(
                name: "ix_job_postings_ward_id",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "benefits",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "detailed_location",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "education_level",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "experience_years",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "job_level",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "job_type",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "province_id",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "requirements",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "ward_id",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "work_mode",
                table: "job_postings");

            migrationBuilder.RenameTable(
                name: "job_postings",
                newName: "job_posting");

            migrationBuilder.AlterColumn<int>(
                name: "status",
                table: "job_posting",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddPrimaryKey(
                name: "pk_job_posting",
                table: "job_posting",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_job_skills_job_posting_job_id",
                table: "job_skills",
                column: "job_id",
                principalTable: "job_posting",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

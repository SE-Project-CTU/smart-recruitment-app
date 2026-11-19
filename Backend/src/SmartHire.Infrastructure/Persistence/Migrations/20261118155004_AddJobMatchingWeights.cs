using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJobMatchingWeights : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "experience_weight",
                table: "job_postings",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0.25m);

            migrationBuilder.AddColumn<decimal>(
                name: "other_weight",
                table: "job_postings",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0.10m);

            migrationBuilder.AddColumn<decimal>(
                name: "skill_weight",
                table: "job_postings",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0.40m);

            migrationBuilder.AddColumn<decimal>(
                name: "title_weight",
                table: "job_postings",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0.25m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "experience_weight",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "other_weight",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "skill_weight",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "title_weight",
                table: "job_postings");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJobPostingFulltextSearch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "search_vector",
                table: "job_postings",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('simple'::regconfig, coalesce(title, ''::text))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "search_vector",
                table: "companies",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('simple'::regconfig, coalesce(name, ''::text))",
                stored: true);

            migrationBuilder.CreateIndex(
                name: "ix_job_postings_search_vector",
                table: "job_postings",
                column: "search_vector")
                .Annotation("Npgsql:IndexMethod", "GIN");

            migrationBuilder.CreateIndex(
                name: "ix_companies_search_vector",
                table: "companies",
                column: "search_vector")
                .Annotation("Npgsql:IndexMethod", "GIN");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_job_postings_search_vector",
                table: "job_postings");

            migrationBuilder.DropIndex(
                name: "ix_companies_search_vector",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "search_vector",
                table: "job_postings");

            migrationBuilder.DropColumn(
                name: "search_vector",
                table: "companies");
        }
    }
}

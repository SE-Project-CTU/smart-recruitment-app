using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationAiAndMediaEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_skills_name",
                table: "skills");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "companies",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "applications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    job_id = table.Column<Guid>(type: "uuid", nullable: false),
                    candidate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cv_version_id = table.Column<Guid>(type: "uuid", nullable: false),
                    uploaded_cv_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    cover_letter = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    applied_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_applications", x => x.id);
                    table.ForeignKey(
                        name: "fk_applications_cv_versions_cv_version_id",
                        column: x => x.cv_version_id,
                        principalTable: "cv_versions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_applications_job_postings_job_id",
                        column: x => x.job_id,
                        principalTable: "job_postings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_applications_users_candidate_id",
                        column: x => x.candidate_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "cv_embeddings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    cv_version_id = table.Column<Guid>(type: "uuid", nullable: false),
                    embedding = table.Column<Vector>(type: "vector", nullable: false),
                    model = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cv_embeddings", x => x.id);
                    table.ForeignKey(
                        name: "fk_cv_embeddings_cv_versions_cv_version_id",
                        column: x => x.cv_version_id,
                        principalTable: "cv_versions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "job_recommendations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    candidate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    job_id = table.Column<Guid>(type: "uuid", nullable: false),
                    score = table.Column<decimal>(type: "numeric", nullable: false),
                    generated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_job_recommendations", x => x.id);
                    table.ForeignKey(
                        name: "fk_job_recommendations_job_postings_job_id",
                        column: x => x.job_id,
                        principalTable: "job_postings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_job_recommendations_users_candidate_id",
                        column: x => x.candidate_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "media_files",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    owner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    file_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_media_files", x => x.id);
                    table.ForeignKey(
                        name: "fk_media_files_users_owner_id",
                        column: x => x.owner_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ai_match_results",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    application_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cv_version_id = table.Column<Guid>(type: "uuid", nullable: false),
                    score = table.Column<decimal>(type: "numeric", nullable: false),
                    analysis = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ai_match_results", x => x.id);
                    table.ForeignKey(
                        name: "fk_ai_match_results_applications_application_id",
                        column: x => x.application_id,
                        principalTable: "applications",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_ai_match_results_cv_versions_cv_version_id",
                        column: x => x.cv_version_id,
                        principalTable: "cv_versions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "application_status_histories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    application_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    changed_by = table.Column<Guid>(type: "uuid", nullable: false),
                    note = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_application_status_histories", x => x.id);
                    table.ForeignKey(
                        name: "fk_application_status_histories_applications_application_id",
                        column: x => x.application_id,
                        principalTable: "applications",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_application_status_histories_users_changed_by",
                        column: x => x.changed_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_users_phone",
                table: "users",
                column: "phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_skills_name",
                table: "skills",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_companies_tax_code",
                table: "companies",
                column: "tax_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ai_match_results_application_id",
                table: "ai_match_results",
                column: "application_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ai_match_results_cv_version_id",
                table: "ai_match_results",
                column: "cv_version_id");

            migrationBuilder.CreateIndex(
                name: "ix_application_status_histories_application_id",
                table: "application_status_histories",
                column: "application_id");

            migrationBuilder.CreateIndex(
                name: "ix_application_status_histories_changed_by",
                table: "application_status_histories",
                column: "changed_by");

            migrationBuilder.CreateIndex(
                name: "ix_applications_candidate_id",
                table: "applications",
                column: "candidate_id");

            migrationBuilder.CreateIndex(
                name: "ix_applications_cv_version_id",
                table: "applications",
                column: "cv_version_id");

            migrationBuilder.CreateIndex(
                name: "ix_applications_job_id",
                table: "applications",
                column: "job_id");

            migrationBuilder.CreateIndex(
                name: "ix_cv_embeddings_cv_version_id",
                table: "cv_embeddings",
                column: "cv_version_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_job_recommendations_candidate_id_job_id",
                table: "job_recommendations",
                columns: new[] { "candidate_id", "job_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_job_recommendations_job_id",
                table: "job_recommendations",
                column: "job_id");

            migrationBuilder.CreateIndex(
                name: "ix_media_files_owner_id",
                table: "media_files",
                column: "owner_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ai_match_results");

            migrationBuilder.DropTable(
                name: "application_status_histories");

            migrationBuilder.DropTable(
                name: "cv_embeddings");

            migrationBuilder.DropTable(
                name: "job_recommendations");

            migrationBuilder.DropTable(
                name: "media_files");

            migrationBuilder.DropTable(
                name: "applications");

            migrationBuilder.DropIndex(
                name: "ix_users_phone",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_skills_name",
                table: "skills");

            migrationBuilder.DropIndex(
                name: "ix_companies_tax_code",
                table: "companies");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "companies",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_skills_name",
                table: "skills",
                column: "name");
        }
    }
}

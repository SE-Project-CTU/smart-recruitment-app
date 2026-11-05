using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJobBookmarks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Vector>(
                name: "embedding",
                table: "job_embeddings",
                type: "vector(768)",
                nullable: false,
                oldClrType: typeof(Vector),
                oldType: "vector");

            migrationBuilder.AlterColumn<Vector>(
                name: "embedding",
                table: "cv_embeddings",
                type: "vector(768)",
                nullable: false,
                oldClrType: typeof(Vector),
                oldType: "vector");

            migrationBuilder.CreateTable(
                name: "job_bookmarks",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    job_posting_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_job_bookmarks", x => new { x.user_id, x.job_posting_id });
                    table.ForeignKey(
                        name: "fk_job_bookmarks_job_postings_job_posting_id",
                        column: x => x.job_posting_id,
                        principalTable: "job_postings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_job_bookmarks_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_job_embeddings_embedding",
                table: "job_embeddings",
                column: "embedding")
                .Annotation("Npgsql:IndexMethod", "hnsw")
                .Annotation("Npgsql:IndexOperators", new[] { "vector_cosine_ops" });

            migrationBuilder.CreateIndex(
                name: "ix_cv_embeddings_embedding",
                table: "cv_embeddings",
                column: "embedding")
                .Annotation("Npgsql:IndexMethod", "hnsw")
                .Annotation("Npgsql:IndexOperators", new[] { "vector_cosine_ops" });

            migrationBuilder.CreateIndex(
                name: "ix_job_bookmarks_job_posting_id",
                table: "job_bookmarks",
                column: "job_posting_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "job_bookmarks");

            migrationBuilder.DropIndex(
                name: "ix_job_embeddings_embedding",
                table: "job_embeddings");

            migrationBuilder.DropIndex(
                name: "ix_cv_embeddings_embedding",
                table: "cv_embeddings");

            migrationBuilder.AlterColumn<Vector>(
                name: "embedding",
                table: "job_embeddings",
                type: "vector",
                nullable: false,
                oldClrType: typeof(Vector),
                oldType: "vector(768)");

            migrationBuilder.AlterColumn<Vector>(
                name: "embedding",
                table: "cv_embeddings",
                type: "vector",
                nullable: false,
                oldClrType: typeof(Vector),
                oldType: "vector(768)");
        }
    }
}

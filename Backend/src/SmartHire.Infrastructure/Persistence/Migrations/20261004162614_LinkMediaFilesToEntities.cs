using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class LinkMediaFilesToEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "avatar_url",
                table: "users");

            migrationBuilder.DropColumn(
                name: "thumbnail_url",
                table: "cv_templates");

            migrationBuilder.DropColumn(
                name: "logo_url",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "uploaded_cv_url",
                table: "applications");

            migrationBuilder.AddColumn<Guid>(
                name: "avatar_file_id",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "thumbnail_file_id",
                table: "cv_templates",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "logo_file_id",
                table: "companies",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "cv_version_id",
                table: "applications",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "uploaded_cv_file_id",
                table: "applications",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_avatar_file_id",
                table: "users",
                column: "avatar_file_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_cv_templates_thumbnail_file_id",
                table: "cv_templates",
                column: "thumbnail_file_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_companies_logo_file_id",
                table: "companies",
                column: "logo_file_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_applications_uploaded_cv_file_id",
                table: "applications",
                column: "uploaded_cv_file_id",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_applications_exactly_one_cv_source",
                table: "applications",
                sql: "(cv_version_id IS NOT NULL) <> (uploaded_cv_file_id IS NOT NULL)");

            migrationBuilder.AddForeignKey(
                name: "fk_applications_media_files_uploaded_cv_file_id",
                table: "applications",
                column: "uploaded_cv_file_id",
                principalTable: "media_files",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_companies_media_files_logo_file_id",
                table: "companies",
                column: "logo_file_id",
                principalTable: "media_files",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_cv_templates_media_files_thumbnail_file_id",
                table: "cv_templates",
                column: "thumbnail_file_id",
                principalTable: "media_files",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_users_media_files_avatar_file_id",
                table: "users",
                column: "avatar_file_id",
                principalTable: "media_files",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_applications_media_files_uploaded_cv_file_id",
                table: "applications");

            migrationBuilder.DropForeignKey(
                name: "fk_companies_media_files_logo_file_id",
                table: "companies");

            migrationBuilder.DropForeignKey(
                name: "fk_cv_templates_media_files_thumbnail_file_id",
                table: "cv_templates");

            migrationBuilder.DropForeignKey(
                name: "fk_users_media_files_avatar_file_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_users_avatar_file_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_cv_templates_thumbnail_file_id",
                table: "cv_templates");

            migrationBuilder.DropIndex(
                name: "ix_companies_logo_file_id",
                table: "companies");

            migrationBuilder.DropIndex(
                name: "ix_applications_uploaded_cv_file_id",
                table: "applications");

            migrationBuilder.DropCheckConstraint(
                name: "ck_applications_exactly_one_cv_source",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "avatar_file_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "thumbnail_file_id",
                table: "cv_templates");

            migrationBuilder.DropColumn(
                name: "logo_file_id",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "uploaded_cv_file_id",
                table: "applications");

            migrationBuilder.AddColumn<string>(
                name: "avatar_url",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "thumbnail_url",
                table: "cv_templates",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "logo_url",
                table: "companies",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "cv_version_id",
                table: "applications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "uploaded_cv_url",
                table: "applications",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }
    }
}

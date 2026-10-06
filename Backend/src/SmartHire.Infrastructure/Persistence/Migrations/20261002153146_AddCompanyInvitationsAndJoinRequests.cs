using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyInvitationsAndJoinRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_company_memberships_company_id_user_id",
                table: "company_memberships");

            migrationBuilder.AddUniqueConstraint(
                name: "ak_company_memberships_company_id_user_id",
                table: "company_memberships",
                columns: new[] { "company_id", "user_id" });

            migrationBuilder.CreateTable(
                name: "company_invitations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    inviter_id = table.Column<Guid>(type: "uuid", nullable: false),
                    invitee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_company_invitations", x => x.id);
                    table.ForeignKey(
                        name: "fk_company_invitations_companies_company_id",
                        column: x => x.company_id,
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_company_invitations_company_memberships_company_id_inviter_",
                        columns: x => new { x.company_id, x.inviter_id },
                        principalTable: "company_memberships",
                        principalColumns: new[] { "company_id", "user_id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_company_invitations_users_invitee_id",
                        column: x => x.invitee_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "company_join_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    reviewed_by = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_company_join_requests", x => x.id);
                    table.ForeignKey(
                        name: "fk_company_join_requests_companies_company_id",
                        column: x => x.company_id,
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_company_join_requests_company_memberships_company_id_review",
                        columns: x => new { x.company_id, x.reviewed_by },
                        principalTable: "company_memberships",
                        principalColumns: new[] { "company_id", "user_id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_company_join_requests_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_company_invitations_company_id_inviter_id",
                table: "company_invitations",
                columns: new[] { "company_id", "inviter_id" });

            migrationBuilder.CreateIndex(
                name: "ix_company_invitations_invitee_id",
                table: "company_invitations",
                column: "invitee_id");

            migrationBuilder.CreateIndex(
                name: "ix_company_join_requests_company_id_reviewed_by",
                table: "company_join_requests",
                columns: new[] { "company_id", "reviewed_by" });

            migrationBuilder.CreateIndex(
                name: "ix_company_join_requests_user_id",
                table: "company_join_requests",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "company_invitations");

            migrationBuilder.DropTable(
                name: "company_join_requests");

            migrationBuilder.DropUniqueConstraint(
                name: "ak_company_memberships_company_id_user_id",
                table: "company_memberships");

            migrationBuilder.CreateIndex(
                name: "ix_company_memberships_company_id_user_id",
                table: "company_memberships",
                columns: new[] { "company_id", "user_id" },
                unique: true);
        }
    }
}

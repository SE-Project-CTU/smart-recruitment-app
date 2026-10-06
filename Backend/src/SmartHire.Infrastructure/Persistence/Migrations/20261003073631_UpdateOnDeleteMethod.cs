using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOnDeleteMethod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_company_invitations_company_memberships_company_id_inviter_",
                table: "company_invitations");

            migrationBuilder.DropForeignKey(
                name: "fk_company_invitations_users_invitee_id",
                table: "company_invitations");

            migrationBuilder.DropForeignKey(
                name: "fk_company_join_requests_company_memberships_company_id_review",
                table: "company_join_requests");

            migrationBuilder.DropForeignKey(
                name: "fk_company_join_requests_users_user_id",
                table: "company_join_requests");

            migrationBuilder.AddForeignKey(
                name: "fk_company_invitations_company_memberships_company_id_inviter_",
                table: "company_invitations",
                columns: new[] { "company_id", "inviter_id" },
                principalTable: "company_memberships",
                principalColumns: new[] { "company_id", "user_id" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_company_invitations_users_invitee_id",
                table: "company_invitations",
                column: "invitee_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_company_join_requests_company_memberships_company_id_review",
                table: "company_join_requests",
                columns: new[] { "company_id", "reviewed_by" },
                principalTable: "company_memberships",
                principalColumns: new[] { "company_id", "user_id" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_company_join_requests_users_user_id",
                table: "company_join_requests",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_company_invitations_company_memberships_company_id_inviter_",
                table: "company_invitations");

            migrationBuilder.DropForeignKey(
                name: "fk_company_invitations_users_invitee_id",
                table: "company_invitations");

            migrationBuilder.DropForeignKey(
                name: "fk_company_join_requests_company_memberships_company_id_review",
                table: "company_join_requests");

            migrationBuilder.DropForeignKey(
                name: "fk_company_join_requests_users_user_id",
                table: "company_join_requests");

            migrationBuilder.AddForeignKey(
                name: "fk_company_invitations_company_memberships_company_id_inviter_",
                table: "company_invitations",
                columns: new[] { "company_id", "inviter_id" },
                principalTable: "company_memberships",
                principalColumns: new[] { "company_id", "user_id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_company_invitations_users_invitee_id",
                table: "company_invitations",
                column: "invitee_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_company_join_requests_company_memberships_company_id_review",
                table: "company_join_requests",
                columns: new[] { "company_id", "reviewed_by" },
                principalTable: "company_memberships",
                principalColumns: new[] { "company_id", "user_id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_company_join_requests_users_user_id",
                table: "company_join_requests",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

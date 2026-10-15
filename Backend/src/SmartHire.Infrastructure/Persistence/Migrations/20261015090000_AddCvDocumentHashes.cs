using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartHire.Infrastructure.Persistence.Migrations;

public partial class AddCvDocumentHashes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "content_hash",
            table: "cvs",
            type: "character varying(64)",
            maxLength: 64,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "presentation_hash",
            table: "cvs",
            type: "character varying(64)",
            maxLength: 64,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "layout_hash",
            table: "cvs",
            type: "character varying(64)",
            maxLength: 64,
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "content_hash", table: "cvs");
        migrationBuilder.DropColumn(name: "presentation_hash", table: "cvs");
        migrationBuilder.DropColumn(name: "layout_hash", table: "cvs");
    }
}

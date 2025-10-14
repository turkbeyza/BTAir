using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BTAir.Migrations
{
    /// <inheritdoc />
    public partial class AddFlightIdToSeatsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Delete all existing seats first to avoid conflicts
            migrationBuilder.Sql("DELETE FROM Seats");

            migrationBuilder.DropForeignKey(
                name: "FK_Seats_Aircraft_AircraftID",
                table: "Seats");

            migrationBuilder.DropIndex(
                name: "IX_Seats_AircraftID_SeatNumber",
                table: "Seats");

            migrationBuilder.AddColumn<string>(
                name: "FlightID",
                table: "Seats",
                type: "nvarchar(10)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "AdminID",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 6, 24, 18, 56, 52, 970, DateTimeKind.Utc).AddTicks(2730));

            migrationBuilder.UpdateData(
                table: "Aircraft",
                keyColumn: "AircraftID",
                keyValue: 1,
                columns: new[] { "CreatedAt", "LastMaintenance", "NextMaintenance" },
                values: new object[] { new DateTime(2025, 6, 24, 18, 56, 52, 970, DateTimeKind.Utc).AddTicks(2760), new DateTime(2025, 6, 24, 18, 56, 52, 970, DateTimeKind.Utc).AddTicks(2750), new DateTime(2025, 9, 22, 18, 56, 52, 970, DateTimeKind.Utc).AddTicks(2750) });

            migrationBuilder.UpdateData(
                table: "Aircraft",
                keyColumn: "AircraftID",
                keyValue: 2,
                columns: new[] { "CreatedAt", "LastMaintenance", "NextMaintenance" },
                values: new object[] { new DateTime(2025, 6, 24, 18, 56, 52, 970, DateTimeKind.Utc).AddTicks(2770), new DateTime(2025, 6, 24, 18, 56, 52, 970, DateTimeKind.Utc).AddTicks(2760), new DateTime(2025, 9, 22, 18, 56, 52, 970, DateTimeKind.Utc).AddTicks(2760) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 1,
                columns: new[] { "CreatedAt", "Password" },
                values: new object[] { new DateTime(2025, 6, 24, 18, 56, 52, 970, DateTimeKind.Utc).AddTicks(2380), "$2a$11$B1CkJunR1xlCBFicHfpsmOHxi3lNZxJRD2JaSsdgxGB7bB78nsx5." });

            migrationBuilder.CreateIndex(
                name: "IX_Seats_AircraftID",
                table: "Seats",
                column: "AircraftID");

            migrationBuilder.CreateIndex(
                name: "IX_Seats_FlightID_SeatNumber",
                table: "Seats",
                columns: new[] { "FlightID", "SeatNumber" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Seats_Aircraft_AircraftID",
                table: "Seats",
                column: "AircraftID",
                principalTable: "Aircraft",
                principalColumn: "AircraftID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Seats_Flights_FlightID",
                table: "Seats",
                column: "FlightID",
                principalTable: "Flights",
                principalColumn: "FlightID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Seats_Aircraft_AircraftID",
                table: "Seats");

            migrationBuilder.DropForeignKey(
                name: "FK_Seats_Flights_FlightID",
                table: "Seats");

            migrationBuilder.DropIndex(
                name: "IX_Seats_AircraftID",
                table: "Seats");

            migrationBuilder.DropIndex(
                name: "IX_Seats_FlightID_SeatNumber",
                table: "Seats");

            migrationBuilder.DropColumn(
                name: "FlightID",
                table: "Seats");

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "AdminID",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 6, 24, 15, 22, 24, 502, DateTimeKind.Utc).AddTicks(1627));

            migrationBuilder.UpdateData(
                table: "Aircraft",
                keyColumn: "AircraftID",
                keyValue: 1,
                columns: new[] { "CreatedAt", "LastMaintenance", "NextMaintenance" },
                values: new object[] { new DateTime(2025, 6, 24, 15, 22, 24, 502, DateTimeKind.Utc).AddTicks(1674), new DateTime(2025, 6, 24, 15, 22, 24, 502, DateTimeKind.Utc).AddTicks(1662), new DateTime(2025, 9, 22, 15, 22, 24, 502, DateTimeKind.Utc).AddTicks(1662) });

            migrationBuilder.UpdateData(
                table: "Aircraft",
                keyColumn: "AircraftID",
                keyValue: 2,
                columns: new[] { "CreatedAt", "LastMaintenance", "NextMaintenance" },
                values: new object[] { new DateTime(2025, 6, 24, 15, 22, 24, 502, DateTimeKind.Utc).AddTicks(1678), new DateTime(2025, 6, 24, 15, 22, 24, 502, DateTimeKind.Utc).AddTicks(1676), new DateTime(2025, 9, 22, 15, 22, 24, 502, DateTimeKind.Utc).AddTicks(1677) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 1,
                columns: new[] { "CreatedAt", "Password" },
                values: new object[] { new DateTime(2025, 6, 24, 15, 22, 24, 502, DateTimeKind.Utc).AddTicks(1099), "$2a$11$aogtxreCet9myXM1nWSdgOYDlmHM4Drl.5fiqv2lBIxWmeKAPL2ba" });

            migrationBuilder.CreateIndex(
                name: "IX_Seats_AircraftID_SeatNumber",
                table: "Seats",
                columns: new[] { "AircraftID", "SeatNumber" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Seats_Aircraft_AircraftID",
                table: "Seats",
                column: "AircraftID",
                principalTable: "Aircraft",
                principalColumn: "AircraftID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

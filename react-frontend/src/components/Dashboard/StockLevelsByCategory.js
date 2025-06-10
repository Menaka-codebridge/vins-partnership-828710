import React, { useState, useEffect } from "react";
import { Skeleton } from "primereact/skeleton";
import { Chart } from "primereact/chart";
import client from "../../services/restClient";

export default function StockLevelsByCategory() {
  const [stockLevels, setStockLevels] = useState({
    spareParts: 0,
    vendingMachines: 0,
    paymentDevices: 0,
    consumables: 0,
  });
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    setLoading(true);
    const fetchStockLevels = async () => {
      try {
        // Fetch spare parts data from parts_master
        const partsMasterResponse = await client.service("partsMaster").find({
          query: {
            $limit: 10000,
          },
        });

        // Fetch vending machines data from machine_master
        const machineMasterResponse = await client.service("machineMaster").find({
          query: {
            $limit: 10000,
          },
        });

        // Calculate total spare parts quantity
        const totalSpareParts = partsMasterResponse.data.reduce(
          (acc, part) => acc + (part.quantity || 0),
          0,
        );

        // Calculate total vending machines
        const totalVendingMachines = machineMasterResponse.total || 0;

        // Update stock levels
        setStockLevels({
          spareParts: totalSpareParts,
          vendingMachines: totalVendingMachines,
          paymentDevices: 0, // Placeholder for now
          consumables: 0, // Placeholder for now
        });

        // Prepare chart data
        const categories = ["Spare Parts", "Vending Machines", "Payment Devices", "Consumables"];
        const values = [
          totalSpareParts,
          totalVendingMachines,
          0, // Placeholder for Payment Devices
          0, // Placeholder for Consumables
        ];

        const documentStyle = getComputedStyle(document.documentElement);
        const data = {
          labels: categories,
          datasets: [
            {
              label: "Stock Levels by Category",
              data: values,
              backgroundColor: [
                documentStyle.getPropertyValue("--blue-500"),
                documentStyle.getPropertyValue("--green-500"),
                documentStyle.getPropertyValue("--yellow-500"),
                documentStyle.getPropertyValue("--red-500"),
              ],
              borderColor: documentStyle.getPropertyValue("--surface-border"),
              borderWidth: 1,
            },
          ],
        };

        const options = {
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: documentStyle.getPropertyValue("--text-color"),
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || "";
                  const value = context.raw || 0;
                  return `${label}: ${value}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: documentStyle.getPropertyValue("--text-color-secondary"),
              },
              grid: {
                color: documentStyle.getPropertyValue("--surface-border"),
              },
              title: {
                display: true,
                text: "Quantity",
                color: documentStyle.getPropertyValue("--text-color"),
              },
            },
            x: {
              ticks: {
                color: documentStyle.getPropertyValue("--text-color-secondary"),
              },
              grid: {
                color: documentStyle.getPropertyValue("--surface-border"),
              },
              title: {
                display: true,
                text: "Categories",
                color: documentStyle.getPropertyValue("--text-color"),
              },
            },
          },
        };

        setChartData(data);
        setChartOptions(options);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stock levels by category:", error);
        setLoading(false);
      }
    };

    fetchStockLevels();
  }, []);

  return (
    <div className="surface-card shadow-2 border-round p-3">
      <div className="flex align-items-center">
        <div
          style={{
            textAlign: "left",
            fontSize: "14px",
            fontWeight: "bold",
            color: "var(--text-color)",
            marginLeft: "0.5rem",
          }}
        >
          <span className="block text-900 font-medium mb-1">
            Stock Levels by Category
          </span>
        </div>
      </div>
      {loading ? (
        <Skeleton width="100%" height="65px" padding="10px" />
      ) : (
        <div>
          <div
            style={{
              textAlign: "left",
              fontSize: "25px",
              fontWeight: "bold",
              color: "var(--text-color)",
              marginLeft: "0.5rem",
            }}
          >
            Spare Parts: {stockLevels.spareParts}
          </div>
          <div
            style={{
              textAlign: "left",
              fontSize: "25px",
              fontWeight: "bold",
              color: "var(--text-color)",
              marginLeft: "0.5rem",
            }}
          >
            Vending Machines: {stockLevels.vendingMachines}
          </div>
          <div
            style={{
              textAlign: "left",
              fontSize: "25px",
              fontWeight: "bold",
              color: "var(--text-color)",
              marginLeft: "0.5rem",
            }}
          >
            Payment Devices: {stockLevels.paymentDevices}
          </div>
          <div
            style={{
              textAlign: "left",
              fontSize: "25px",
              fontWeight: "bold",
              color: "var(--text-color)",
              marginLeft: "0.5rem",
            }}
          >
            Consumables: {stockLevels.consumables}
          </div>
          <div style={{ marginTop: "20px", height: "300px" }}>
            <Chart
              type="bar"
              data={chartData}
              options={chartOptions}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
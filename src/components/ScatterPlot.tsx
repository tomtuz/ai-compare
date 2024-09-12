import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ProcessedModelData } from "@/utils/dataProcessing";

interface ScatterPlotProps {
  data: ProcessedModelData[];
}

/**
 * ScatterPlot component for visualizing the relationship between cost and efficiency of AI models
 * @param {ScatterPlotProps} props - The props for the ScatterPlot component
 * @returns {JSX.Element} The rendered ScatterPlot component
 */
export function ScatterPlot({ data }: ScatterPlotProps) {
  // Process the data for the scatter plot
  const chartData = data.map((model) => ({
    name: model.name,
    cost: model.inputCost + model.outputCost,
    efficiency: model.efficiencyScore,
    isModified: model.isModified,
    source: model.source,
  }));

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="cost"
            name="Cost"
            unit="$"
            label={{ value: "Cost ($)", position: "bottom", offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="efficiency"
            name="Efficiency"
            unit="%"
            label={{
              value: "Efficiency (%)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 border border-gray-300 rounded shadow">
                    <p className="font-bold">{data.name}</p>
                    <p>Cost: ${data.cost.toFixed(6)}</p>
                    <p>Efficiency: {data.efficiency.toFixed(2)}%</p>
                    <p>Source: {data.source}</p>
                    {data.isModified && (
                      <p className="text-blue-500">Modified</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Scatter
            name="AI Models"
            data={chartData}
            fill="#8884d8"
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

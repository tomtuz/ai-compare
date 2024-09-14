import { useMemo } from "react";
import {
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  Line,
  ComposedChart,
} from "recharts";
import { useModelList } from "@table/hooks";
import { calculateLinearRegression } from "@plot/utils/plotFunctions";
import type { ChartData, ProcessedModelData } from "@/types";

interface ScatterPlotProps {
  modelListLogic: ReturnType<typeof useModelList>;
}

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function ScatterPlot({ modelListLogic }: ScatterPlotProps) {
  const { allProcessedData, favorites } = modelListLogic;

  const chartDataList: ChartData[] = [];
  // step 1. calculate efficiency scores
  const chartData = useMemo(() => {
    for (const model of allProcessedData) {
      if (
        model.efficiencyScore <= 0 ||
        model.inputCost <= 0 ||
        model.outputCost <= 0
      ) {
        continue;
      }

      if (!model.name) {
        console.log("model data invalid: ", model);
      }

      chartDataList.push({
        name: model.name,
        cost: calculateCost(model),
        efficiency: model.efficiencyScore ?? 0,
        isFavorite: favorites.includes(model.id),
        isModified: model.isModified,
        inputCost: model.inputCost,
        outputCost: model.outputCost,
        source: model.source,
      });
    }
    console.log("chartDataList: ", chartDataList);
    return chartDataList;
  }, [allProcessedData, favorites]);

  function calculateCost(model: ProcessedModelData): number {
    // input vs. output ratio of ~ 22:1
    const inputTokenM = 11102525 / 1_000_000;
    const outputTokenM = 502975 / 1_000_000;
    const cost =
      inputTokenM * model.inputCost + outputTokenM * model.outputCost;
    return Number(formatter.format(cost));
  }

  // Calculate trendline data
  const trendlineData = useMemo(() => {
    const points = chartData.map((d) => ({ x: d.cost, y: d.efficiency }));
    const { slope, intercept } = calculateLinearRegression(points);
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    return [
      { cost: minX, efficiency: slope * minX + intercept },
      { cost: maxX, efficiency: slope * maxX + intercept },
    ];
  }, [chartData]);

  return (
    <div className="h-[65vh] w-[80vw] rounded-lg bg-white p-4 shadow-lg">
      <h2 className="mb-4 text-center text-xl font-bold text-gray-800">
        Cost vs Efficiency
      </h2>
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
        >
          <XAxis
            type="number"
            dataKey="cost"
            name="Cost"
            unit="$"
            label={{
              value: "Cost (10M/$)",
              position: "insideBottomRight",
              offset: -15,
            }}
            tick={{ fill: "#4B5563" }}
          />
          <YAxis
            type="number"
            dataKey="efficiency"
            name="Efficiency"
            label={{
              value: "Efficiency Score",
              angle: -90,
              position: "insideLeft",
            }}
            tick={{ fill: "#4B5563" }}
          />

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
          />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              border: "1px solid #E5E7EB",
              borderRadius: "0.375rem",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            content={({ active, payload }) => {
              if (active && payload?.length) {
                const data = payload[0].payload;
                return (
                  <div className="p-2">
                    <p className="font-bold text-gray-800">{data.name}</p>
                    <p className="text-gray-600">Cost: ${data.cost}</p>
                    <p className="text-gray-600">Input: ${data.inputCost}</p>
                    <p className="text-gray-600">Output: ${data.outputCost}</p>
                    <p className="text-gray-600">
                      Efficiency Score: {data.efficiency.toFixed(2)}
                    </p>
                    <p className="text-gray-600">Source: {data.source}</p>
                    {data.isModified && (
                      <p className="text-blue-500">Modified</p>
                    )}
                    {data.isFavorite && (
                      <p className="text-yellow-500">Favorited</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          <Legend
            verticalAlign="bottom"
            height={42}
          />

          <Scatter
            name="AI Models"
            data={chartData}
            fill="#8884d8"
          >
            {chartData.map((entry, index) => (
              <Cell
                r={entry.isFavorite ? 8 : 5}
                key={`cell-${index}`}
                fill={entry.isFavorite ? "#FCD34D" : "#8884d8"}
                stroke={entry.isFavorite ? "#F59E0B" : "#6366F1"}
              />
            ))}
          </Scatter>
          {/* Add the trendline */}
          <Line
            name="Trendline"
            data={trendlineData}
            dataKey="efficiency"
            stroke="#ff7300"
            dot={false}
            activeDot={false}
            legendType="line"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

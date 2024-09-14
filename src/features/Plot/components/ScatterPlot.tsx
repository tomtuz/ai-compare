import { useEffect, useMemo, useState } from "react";
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
  ReferenceLine,
} from "recharts";
import { useModelList } from "@table/hooks";
import { calculateLinearRegression } from "@plot/utils/plotFunctions";
import { quantile } from "simple-statistics";
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

  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseMove = (props: any) => {
    if (props.activePayload?.length) {
      setTooltipPos({
        x: props.activePayload[0].payload.cost,
        y: props.activePayload[0].payload.efficiency,
      });
      setMousePosition({ x: props.chartX, y: props.chartY });
    }
  };

  const handleMouseLeave = () => {
    setTooltipPos(null);
  };

  useEffect(() => {
    if (tooltipPos) {
      const timer = setTimeout(() => setShowTooltip(true), 100);
      return () => clearTimeout(timer);
    }

    setShowTooltip(false);
  }, [tooltipPos]);

  // step 1. calculate efficiency scores
  const chartData = useMemo(() => {
    return allProcessedData
      .filter(
        (model) =>
          model.efficiencyScore > 0 &&
          model.inputCost > 0 &&
          model.outputCost > 0 &&
          model.name,
      )
      .map((model) => ({
        name: model.name,
        cost: calculateCost(model),
        efficiency: model.efficiencyScore ?? 0,
        isFavorite: favorites.includes(model.id),
        isModified: model.isModified,
        inputCost: model.inputCost,
        outputCost: model.outputCost,
        source: model.source,
      }));
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
    const filteredData = chartData || removeOutliers(chartData);
    // const filteredData = removeOutliers(chartData);
    const points = filteredData.map((d) => ({ x: d.cost, y: d.efficiency }));
    const { slope, intercept } = calculateLinearRegression(points);
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    return [
      { cost: minX, efficiency: slope * minX + intercept, source: "trendline" },
      { cost: maxX, efficiency: slope * maxX + intercept, source: "trendline" },
    ];
  }, [chartData]);

  function removeOutliers(data: ChartData[]): ChartData[] {
    const costs = data.map((d) => d.cost);
    const efficiencies = data.map((d) => d.efficiency);

    const costQ1 = quantile(costs, 0.25);
    const costQ3 = quantile(costs, 0.75);
    const costIQR = costQ3 - costQ1;

    const efficiencyQ1 = quantile(efficiencies, 0.25);
    const efficiencyQ3 = quantile(efficiencies, 0.75);
    const efficiencyIQR = efficiencyQ3 - efficiencyQ1;

    return data.filter(
      (d) =>
        d.cost >= costQ1 - 1.5 * costIQR &&
        d.cost <= costQ3 + 1.5 * costIQR &&
        d.efficiency >= efficiencyQ1 - 1.5 * efficiencyIQR &&
        d.efficiency <= efficiencyQ3 + 1.5 * efficiencyIQR,
    );
  }

  interface CustomTooltipProps {
    children?: any;
  }

  function CustomTooltipContainer({ children }: CustomTooltipProps) {
    const { x, y } = mousePosition;
    return (
      <div
        style={{
          position: "fixed",
          left: `${x + 10}px`,
          top: `${y + 10}px`,
          pointerEvents: "none",
          zIndex: 100,
          transition: "all 0.2s ease-out",
        }}
      >
        {children}
      </div>
    );
  }

  interface TooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
  }

  function CustomTooltip({ active, payload }: TooltipProps) {
    if (!active || !payload?.length) return null;
    if (!showTooltip) return null;
    const data = payload[0].payload;
    // console.log("categoryPayload: ", payload);

    // dont show trendline dots
    // if (!data.name) return null;

    return (
      <CustomTooltipContainer>
        <div className="flex flex-col rounded-md border border-gray-400 bg-gray-100 bg-opacity-80 p-1 text-left shadow-lg">
          <p className="font-bold">{`[x: ${formatter.format(Number(data.cost))}, y: ${formatter.format(data.efficiency)}]`}</p>
          <p className="font-bold text-gray-800">{data.name}</p>
          <p className="text-gray-600">Cost: ${data.cost}</p>
          <p className="text-gray-600">Input: ${data.inputCost}</p>
          <p className="text-gray-600">Output: ${data.outputCost}</p>
          <p className="text-gray-600">Efficiency Score: {data.efficiency}</p>
          <p className="text-gray-600">Source: {data.source}</p>
          {data.isModified && <p className="text-blue-500">Modified</p>}
          {data.isFavorite && <p className="text-yellow-500">Favorited</p>}
        </div>
      </CustomTooltipContainer>
    );
  }

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
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
        >
          <XAxis
            type="number"
            dataKey="cost"
            name="Cost"
            domain={[0, "dataMax"]}
            unit="$"
            label={{
              value: "Cost (~11.6M/$)",
              position: "insideBottomRight",
              offset: -15,
            }}
            tick={{ fill: "#4B5563" }}
            style={{
              fontSize: "12px",
              fontFamily: "Inter; Helvetica",
            }}
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            type="number"
            dataKey="efficiency"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => `${Number(formatter.format(value))}`}
            name="Efficiency"
            label={{
              value: "Efficiency Score",
              angle: -90,
              position: "insideLeft",
            }}
            tick={{ fill: "#4B5563" }}
            style={{
              fontSize: "12px",
              fontFamily: "Inter; Helvetica",
            }}
            padding={{ bottom: 10, top: 10 }}
          />

          <Legend
            verticalAlign="bottom"
            height={42}
          />

          <CartesianGrid stroke="#E5E7EB" />

          <Tooltip
            content={<CustomTooltip />}
            position={{ x: 0, y: 0 }}
            wrapperStyle={{ pointerEvents: "none" }}
            cursor={{ strokeDasharray: "3 3" }}
          />

          <Scatter
            name="Models"
            data={chartData}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                name={entry.name}
                r={entry.isFavorite ? 8 : 5}
                fill={entry.isFavorite ? "#FCD34D" : "#8884d8"}
                stroke={entry.isFavorite ? "#F59E0B" : "#6366F1"}
              />
            ))}
          </Scatter>
          <Line
            name="Trendline"
            data={trendlineData}
            dataKey="efficiency"
            stroke="#ff7300"
            dot={true}
            activeDot={false}
            legendType="line"
            isAnimationActive={false}
          />
          {tooltipPos && (
            <>
              <ReferenceLine
                x={tooltipPos.x}
                stroke="#666"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={tooltipPos.y}
                stroke="#666"
                strokeDasharray="3 3"
              />
            </>
          )}
          {/* Add the trendline */}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

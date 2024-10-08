import { Table } from "@table";
import { useModelList } from "@table";
import { useState } from "react";
import { ScatterPlot } from "../features/Plot/components/ScatterPlot";
import { useAPIService } from "@/services/APIService";

export function ModelList() {
  // Fetch models using the APIService hook
  const { useModels, refreshModels } = useAPIService();
  const { data: models, isLoading, error } = useModels();

  // Use the model list logic hook
  const modelListLogic = useModelList(models || []);

  // State for showing/hiding the graph
  const [showGraph, setShowGraph] = useState(false);

  // Handle refresh button click
  const handleRefresh = async () => {
    await refreshModels();
  };

  if (isLoading) return <div>Loading models...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
          AI Models
        </h2>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white text-sm sm:text-base rounded hover:bg-blue-600"
        >
          Fetch Models
        </button>
      </div>

      {/* Table component */}
      <div className="flex-grow overflow-hidden">
        <Table modelListLogic={modelListLogic} />
      </div>

      {/* Graph toggle button */}
      <div className="mt-4">
        <button
          onClick={() => setShowGraph(!showGraph)}
          className="px-3 py-1 sm:px-4 sm:py-2 bg-green-500 text-white text-sm sm:text-base rounded hover:bg-green-600"
        >
          {showGraph ? "Hide Graph" : "Show Graph"}
        </button>
      </div>

      {/* Graph modal */}
      {showGraph && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          id="my-modal"
        >
          <div className="relative mx-auto top-10 border w-11/12 max-w-[80vw] shadow-lg rounded-md bg-white">
            <div className="text-center">
              <div className="flex items-center justify-center w-full px-7 py-3">
                {/* Placeholder for graph component */}
                <ScatterPlot modelListLogic={modelListLogic} />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => setShowGraph(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

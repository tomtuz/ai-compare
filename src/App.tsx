import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "react-query";
import { useModels, useRefreshModels } from "@/services/APIService";
import {
  processModelData,
  sortModels,
  filterModels,
} from "@/utils/dataProcessing";
import type { ProcessedModelData } from "@/utils/dataProcessing";
import { Table } from "@/components/Table";
import { ScatterPlot } from "@/components/ScatterPlot";

const queryClient = new QueryClient();

function ModelList() {
  const { data: models, isLoading, error } = useModels(queryClient);
  const refreshModels = useRefreshModels(queryClient);
  const [sortBy, setSortBy] = useState<keyof ProcessedModelData>("name");
  const [sortAscending, setSortAscending] = useState(true);
  const [filterName] = useState("");
  const [showGraph, setShowGraph] = useState(false);
  const localQueryClient = useQueryClient();

  const processedModels = models
    ? models.map((model) => processModelData(model as any))
    : [];

  const handleSort = useCallback((key: keyof ProcessedModelData) => {
    setSortBy((prevKey) => {
      if (prevKey === key) {
        setSortAscending((prev) => !prev);
      } else {
        setSortAscending(true);
      }
      return key;
    });
  }, []);

  const sortedModels = sortModels(processedModels, sortBy, sortAscending);
  const filteredModels = filterModels(sortedModels, { name: filterName });

  const handleRefresh = async () => {
    await refreshModels();
  };

  if (isLoading)
    return (
      <div className="text-center mt-8 text-gray-600">Loading models...</div>
    );
  if (error)
    return (
      <div className="text-center mt-8 text-red-600 bg-red-100 p-4 rounded-lg">
        An error occurred: {error.message}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">AI Models</h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Fetch Models
        </button>
      </div>
      <Table
        data={filteredModels}
        onSort={handleSort}
        sortBy={sortBy}
        sortAscending={sortAscending}
        queryClient={localQueryClient}
      />
      <div className="mt-8">
        <button
          onClick={() => setShowGraph(!showGraph)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {showGraph ? "Hide Graph" : "Show Graph"}
        </button>
      </div>
      {showGraph && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="my-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-11/12 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Cost vs Efficiency
              </h3>
              <div className="mt-2 px-7 py-3">
                <ScatterPlot data={filteredModels} />
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

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900">
              AI Model Comparison
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white rounded-lg shadow p-6">
                <ModelList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;

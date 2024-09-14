import { QueryClient, QueryClientProvider } from "react-query";
import { ModelList } from "@/components/ModelList";
import { useAppContext } from "./context/AppContext";

const queryClient = new QueryClient();

export function App() {
  const { apiCallCount } = useAppContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-gray-100">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              AI API Provider Comparison
            </h1>
          </div>
        </header>
        <main className="flex-grow overflow-hidden">
          <div className="mx-auto h-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div>API calls: {apiCallCount}</div>
            <div className="h-full overflow-hidden">
              <div className="h-full overflow-hidden rounded-lg bg-white p-4 shadow">
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

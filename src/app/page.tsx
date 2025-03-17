import PricingTable from "@/components/pricing/PricingTable";
import { loadData } from "@/lib/dataService";
import Link from "next/link";

export default async function Home() {
  // Load data with relationships established
  // This will use Prisma in development and JSON in production
  const { models, categories, vendors } = await loadData();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <PricingTable
          models={models}
          categories={categories}
          vendors={vendors}
        />
        <div className="container mx-auto px-4 pt-2 pb-6">
          <p className="text-gray-600 text-center max-w-2xl mx-auto">
            Navigate the complex landscape of AI models with ease. This tool
            helps developers find the right model for their projects by
            comparing pricing across providers.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto mt-8 mb-4 px-4 border-t border-gray-200 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 mb-4">
          <div className="flex space-x-6">
            <Link
              href="https://github.com/mattsilv/inference"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              <span className="flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  className="mr-2"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </span>
            </Link>
            <Link
              href="https://github.com/mattsilv/inference/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  className="mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Suggestions
              </span>
            </Link>
            <Link
              href="https://silv.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              silv.app
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

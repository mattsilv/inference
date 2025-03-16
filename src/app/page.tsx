import PricingTable from '@/components/pricing/PricingTable';
import { loadData } from '@/lib/dataService';

export default async function Home() {
  // Load data with relationships established
  // This will use Prisma in development and JSON in production
  const { models, categories, vendors } = await loadData();
  
  return (
    <PricingTable 
      models={models} 
      categories={categories} 
      vendors={vendors} 
    />
  );
}

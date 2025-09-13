import PageList from '@/components/PageList';

export const metadata = {
  title: 'Pages - VGBF',
  description: 'All pages and content from Västra Götalands Bågskytteförbund',
};

export default function PagesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All Pages
          </h1>
          <p className="text-lg text-gray-600">
            Browse all available content and information pages.
          </p>
        </div>
        
        <PageList className="space-y-8" />
      </div>
    </div>
  );
}
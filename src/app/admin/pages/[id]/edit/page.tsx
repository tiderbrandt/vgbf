import PageForm from '@/components/admin/PageForm';

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function EditPagePage({ params }: EditPageProps) {
  return <PageForm pageId={params.id} mode="edit" />;
}
import VisitorQrForm from '@/components/visitor/VisitorQrForm';

export default function QrLinkPage({ params }: { params: { code: string } }) {
  return <VisitorQrForm initialCode={params.code} />;
}

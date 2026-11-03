import { useParams } from "react-router-dom";

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto min-h-[60vh] px-4 py-8">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold text-text-main">Chi tiết công ty</h1>
        <p className="mt-2 text-sm text-text-muted">
          Đang khởi tạo thông tin công ty ({id})...
        </p>
      </div>
    </div>
  );
}

export default CompanyDetailPage;


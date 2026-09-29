const Page = ({ title }: { title: string }) => (
  <div className="p-8 bg-surface border border-border-app rounded-xl shadow-sm">
    <h1 className="text-2xl font-bold text-primary">{title}</h1>
    <p className="text-sm text-text-muted mt-2">
      Nếu bạn thấy dòng này, nghĩa là Router đã hoạt động hihihi
    </p>
  </div>
);

export default Page;

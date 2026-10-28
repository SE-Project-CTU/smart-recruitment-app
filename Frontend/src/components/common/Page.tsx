const Page = ({ title }: { title: string }) => (
  <div className="border-border-app rounded-xl border bg-surface p-8 shadow-sm">
    <h1 className="text-2xl font-bold text-primary">{title}</h1>
    <p className="mt-2 text-sm text-text-muted">
      Nếu bạn thấy dòng này, nghĩa là Router đã hoạt động hihihi
    </p>
  </div>
);

export { Page };
export default Page;

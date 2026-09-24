import { Link, Outlet } from "react-router-dom";

const BaseLayout = () => (
  <div className="min-h-screen bg-bg-app text-text-main font-sans p-6">
    <header className="flex gap-4 mb-6 p-4 bg-surface border border-border-app rounded-lg shadow-sm">
      <Link to="/" className="font-bold text-primary">
        SmartHire
      </Link>
      <span className="text-text-muted">|</span>
      <Link to="/" className="hover:underline">
        Home
      </Link>
      <Link to="/login" className="hover:underline">
        Login
      </Link>
      <Link to="/candidate/cv-builder" className="hover:underline">
        CV Builder
      </Link>
      <Link to="/employer/applicants" className="hover:underline">
        HR Applicants (ATS)
      </Link>
    </header>

    <main>
      <Outlet />
    </main>
  </div>
);

export default BaseLayout;

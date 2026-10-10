import Header from "@/components/Header";
import { Outlet } from "react-router-dom";

const BaseLayout = () => (
  <div className="font-sans text-text-main">
    <Header />
    <main className="bg-bg-white-blue">
      <Outlet />
    </main>
  </div>
);

export default BaseLayout;

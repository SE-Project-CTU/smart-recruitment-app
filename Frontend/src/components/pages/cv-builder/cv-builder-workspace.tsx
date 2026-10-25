import { ModernTwoColumnTemplate } from "@/components/pages/cv-builder/templates/ModernTwoColumn";
import { MOCK_CV_DETAIL } from "@/constants/mockCvData";

export default function CvBuilderWorkspace() {
  return (
    <main className="flex flex-1 justify-center overflow-x-auto px-4 py-8">
      <div className="w-full max-w-[850px]">
        <ModernTwoColumnTemplate data={MOCK_CV_DETAIL} />
      </div>
    </main>
  );
}

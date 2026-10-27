import { ModernTwoColumnTemplate } from "@/components/pages/cv-builder/templates/ModernTwoColumn";
import { MOCK_CV_DETAIL } from "@/constants/mockCvData";

export default function CvBuilderWorkspace() {
  return (
    <main className="flex flex-1 justify-center overflow-x-auto px-2 py-6">
      <div className="w-full max-w-[850px]">
        // @ts-expect-error Mock data format difference
        <ModernTwoColumnTemplate data={MOCK_CV_DETAIL as any} />
      </div>
    </main>
  );
}

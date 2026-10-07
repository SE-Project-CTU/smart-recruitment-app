import React from "react";
import { type TestimonialItem } from "@/constants/mockData";

interface TestimonialCardProps {
  data: TestimonialItem;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  data,
  className = "",
}) => {
  return (
    <div
      className={`flex w-80 shrink-0 flex-col justify-between gap-4 rounded-2xl border border-stone-200/60 bg-[#f3f4f6] p-6 whitespace-normal shadow-sm transition-all hover:shadow-md sm:w-96 ${className}`}
    >
      <div className="flex items-center gap-4">
        <img
          src={data.avatar}
          alt={data.name}
          className="h-12 w-12 shrink-0 rounded-full border border-stone-300 object-cover"
        />
        <div className="flex min-w-0 flex-col">
          <h3 className="truncate text-base leading-snug font-bold text-stone-900">
            {data.name}
          </h3>
          <p className="truncate text-xs font-medium text-stone-500">
            {data.company}
          </p>
        </div>
      </div>

      <p className="line-clamp-4 leading-relaxed font-normal wrap-break-word text-stone-700">
        {data.comment}
      </p>
    </div>
  );
};

export default TestimonialCard;

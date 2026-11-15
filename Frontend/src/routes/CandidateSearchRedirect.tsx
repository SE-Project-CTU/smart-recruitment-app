import { Navigate, useLocation } from "react-router-dom";
import { PATHS } from "@/constants/paths";

export function CandidateSearchRedirect() {
  const location = useLocation();
  return <Navigate to={`${PATHS.SEARCH_JOB}${location.search}`} replace />;
}

export default CandidateSearchRedirect;


import { Smarthire_icon_default } from "@/assets/images/logo";

function LoadingScreen() {
  return (
    <div className="relative">
      <img
        src={Smarthire_icon_default}
        alt=""
        loading="lazy"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <span className="loader"></span>
    </div>
  );
}

export default LoadingScreen;

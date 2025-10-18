import { Shell } from "lucide-react";

export default function Loader() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Shell className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  );
}

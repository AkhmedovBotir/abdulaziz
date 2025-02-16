import { Button } from "@/components/ui/button";
import { SiFacebook } from "react-icons/si";

export function FacebookLoginButton() {
  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2 border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
      onClick={() => {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        window.open(
          "/auth/facebook",
          "Facebook Login",
          `width=${width},height=${height},left=${left},top=${top}`
        );
      }}
    >
      <SiFacebook className="h-5 w-5" />
      Facebook orqali kirish
    </Button>
  );
}
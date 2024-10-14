import Link from "next/link";

import { cn } from "@/utils";

interface LinkButtonProps {
  text: string;
  href: string;
  buttonImg?: string;
  className?: string;
}

const LinkButton = ({ text, href, buttonImg, className }: LinkButtonProps) => {
  return (
    <Link
      className={cn(
        "flex items-center justify-center font-bold text-white text-base leading-normal m-0 py-3 px-3 bg-black rounded-2xl border-[none] shadow-[0_0px_1px_hsla(0,0%,0%,0.2),0_1px_2px_hsla(0,0%,0%,0.2)] hover:shadow-[0_0px_1px_hsla(0,0%,0%,0.6),0_1px_8px_hsla(0,0%,0%,0.2)] active:shadow-[0_0px_1px_hsla(0,0%,0%,0.4)] active:translate-y-[1px] active:bg-black",
        className
      )}
      href={href}
    >
      {text}
      {buttonImg && <img src={`/${buttonImg}`} alt="" />}
    </Link>
  );
};

export default LinkButton;

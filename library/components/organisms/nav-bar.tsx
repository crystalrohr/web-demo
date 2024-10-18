import Image from "next/image";

import SignInWithKeyless from "@/components/molecules/siwk-button";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-6 h-[80px] z-[99999]">
      <Image src={"/logo.svg"} alt={"logo"} width={"190"} height={"3"} />

      <SignInWithKeyless />
    </div>
  );
};

export default Navbar;

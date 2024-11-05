import Connect from "@/components/molecules/connect";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-6 h-[80px] relative z-[9] bg-white">
      <Link href={"/"}>
        <Image src={"/logo.svg"} alt={"logo"} width={"190"} height={"3"} />
      </Link>
      <Connect />
    </div>
  );
};

export default Navbar;

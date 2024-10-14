import LinkButton from "@/components/molecules/link-button";

const Footer = () => {
  return (
    <div className=" bg-[#052437] py-20 flex flex-col items-center gap-[80px]">
      <div className=" flex flex-col items-center gap-9">
        <p className=" font-atyp text-[64px] leading-[80px] text-white w-[646px] text-center">
          Become a node and earn rewards!
        </p>
        <LinkButton
          className="bg-[#138FA8] active:bg-[#138FA8] py-3 px-6 rounded-[32px] font-outfit font-medium gap-2"
          href="/console"
          text={"Get started right now!"}
          buttonImg="sort.svg"
        />
      </div>
      <p className=" font-outfit text-white">© Crystalrohr 2024</p>
    </div>
  );
};

export default Footer;

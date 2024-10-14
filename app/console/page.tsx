import StandbyButton from "@/components/molecules/standby-button";

const page = () => {
  return (
    <div className="flex flex-col justify-between items-center flex-1 overflow-scroll w-full">
      <div className="flex flex-col justify-start items-center gap-16">
        <div className="flex flex-col justify-center items-center gap-1 p-0">
          <p className="font-atyp text-[64px] text-[#02071E] text-balance w-[15ch] leading-tight text-center">
            Start your node and earn rohr rewards!
          </p>
          <p className="font-medium text-sm leading-[17px] text-[#484E62]">
            To secure the network, you&apos;ll need to stake some coins. Click
            here to access a faucet.
          </p>
        </div>
        <StandbyButton link={"/console/dashboard"} />
      </div>
      <p className=" font-outfit p-4 text-sm">© Crystalrohr 2024</p>
    </div>
  );
};

export default page;

import { useState } from "react";

import { Button } from "@/components/atoms/button";
import AdaptiveModal from "@/components/molecules/adaptive-modal";
import { NetworkModalContext } from "@/types";
import NetworkSelect, { NetworkIds } from "./network-select";

const ConfirmPage = ({
  context,
  onNavigate,
  onClose,
}: {
  context: NetworkModalContext;
  onNavigate: (pageId: string) => void;
  onClose: () => void;
}) => (
  <div>
    <p>Confirm connection to {context.network}?</p>
    <Button
      onClick={() => {
        onClose();
        onNavigate("select");
      }}
    >
      Confirm
    </Button>
  </div>
);

const Connect = () => {
  const [toNetwork, setToNetwork] = useState<NetworkModalContext>({
  } as NetworkModalContext);

  return (
    <AdaptiveModal
      trigger={
        <button className="font-outfit font-[16px] bg-black text-[white] px-6 rounded-[32px] py-3.5">
          {toNetwork.network ? toNetwork.network : "Connect"}
        </button>
      }
      initialPage="select"
      context={toNetwork}
      onContextChange={(newContext) => setToNetwork(newContext)}
      pages={[
        {
          id: "select",
          title: "Select Network",
          component: NetworkSelect,
        },
        {
          id: "confirm",
          title: "Confirm Connection",
          component: ConfirmPage,
        },
      ]}
    />
  );
};

export default Connect;

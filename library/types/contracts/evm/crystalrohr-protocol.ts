const data = {
  name: "Crystalrohr Protocol",
  address: "",
  abi: [
    {
      type: "constructor",
      inputs: [
        { name: "_rohrToken", type: "address", internalType: "address" },
        { name: "_stakingContract", type: "address", internalType: "address" },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "VIDEO_OP_PRICE",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "captionVideo",
      inputs: [{ name: "videoHash", type: "string", internalType: "string" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "claimRewards",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "completeCaptionVideo",
      inputs: [{ name: "captionHash", type: "string", internalType: "string" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getVideoCaption",
      inputs: [
        { name: "userAddress", type: "address", internalType: "address" },
      ],
      outputs: [{ name: "", type: "string", internalType: "string" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "joinPool",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "nodes",
      inputs: [{ name: "", type: "address", internalType: "address" }],
      outputs: [
        { name: "operationProofs", type: "uint256", internalType: "uint256" },
        { name: "pendingVideoHash", type: "string", internalType: "string" },
        { name: "taskAddress", type: "address", internalType: "address" },
        { name: "exists", type: "bool", internalType: "bool" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "rohrToken",
      inputs: [],
      outputs: [
        { name: "", type: "address", internalType: "contract RohrToken" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "stake",
      inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "stakingContract",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract CrystalrohrStaking",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "unstake",
      inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "userVideos",
      inputs: [{ name: "", type: "address", internalType: "address" }],
      outputs: [
        { name: "videoHash", type: "string", internalType: "string" },
        { name: "userAddress", type: "address", internalType: "address" },
        { name: "nodeAddress", type: "address", internalType: "address" },
        { name: "captionHash", type: "string", internalType: "string" },
        { name: "exists", type: "bool", internalType: "bool" },
      ],
      stateMutability: "view",
    },
    {
      type: "event",
      name: "NodeJoinedPool",
      inputs: [
        {
          name: "nodeAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "NodeLeftPool",
      inputs: [
        {
          name: "nodeAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "VideoCaptionCompleted",
      inputs: [
        {
          name: "userAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "videoHash",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "nodeAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "captionHash",
          type: "string",
          indexed: false,
          internalType: "string",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "VideoCaptionRequested",
      inputs: [
        {
          name: "userAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "videoHash",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "nodeAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    { type: "error", name: "InvalidVideoHash", inputs: [] },
    { type: "error", name: "NoRewardsAvailable", inputs: [] },
    { type: "error", name: "NodeAlreadyActive", inputs: [] },
    { type: "error", name: "NodeNotActive", inputs: [] },
    { type: "error", name: "NodeNotRegistered", inputs: [] },
    { type: "error", name: "NodeUnavailable", inputs: [] },
    { type: "error", name: "VideoHashMismatch", inputs: [] },
    { type: "error", name: "VideoNotFound", inputs: [] },
  ],
} as const;

export default data;

const data = {
  address: "0x19d8e370ccb0e6f391a168dc53619d51f3dee52cc429c41ca9b6462209c15a8b",
  name: "crystalrohr_protocol",
  friends: [],
  exposed_functions: [
    {
      name: "caption_video",
      visibility: "private",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "0x1::string::String"],
      return: [],
    },
    {
      name: "claim_rewards",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer"],
      return: [],
    },
    {
      name: "complete_caption_video",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "0x1::string::String"],
      return: [],
    },
    {
      name: "get_video_caption",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["0x1::option::Option<0x1::option::Option<0x1::string::String>>"],
    },
    {
      name: "join_pool",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer"],
      return: [],
    },
    {
      name: "stake",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "u64"],
      return: [],
    },
    {
      name: "staked_amount",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["u64"],
    },
    {
      name: "unstake",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "u64"],
      return: [],
    },
    {
      name: "valid_staker",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["bool"],
    },
  ],
  structs: [
    {
      name: "Node",
      is_native: false,
      is_event: false,
      abilities: ["key"],
      generic_type_params: [],
      fields: [
        {
          name: "operation_proofs",
          type: "u64",
        },
        {
          name: "pending_task",
          type: "bool",
        },
        {
          name: "task_address",
          type: "0x1::option::Option<address>",
        },
      ],
    },
    {
      name: "NodeProof",
      is_native: false,
      is_event: false,
      abilities: ["copy", "drop", "store"],
      generic_type_params: [],
      fields: [
        {
          name: "node_address",
          type: "address",
        },
        {
          name: "caption",
          type: "0x1::option::Option<0x1::string::String>",
        },
      ],
    },
    {
      name: "ProtocolPool",
      is_native: false,
      is_event: false,
      abilities: ["key"],
      generic_type_params: [],
      fields: [
        {
          name: "active",
          type: "0x1::smart_vector::SmartVector<address>",
        },
      ],
    },
    {
      name: "User",
      is_native: false,
      is_event: false,
      abilities: ["store", "key"],
      generic_type_params: [],
      fields: [
        {
          name: "video",
          type: "0x1::option::Option<0x19d8e370ccb0e6f391a168dc53619d51f3dee52cc429c41ca9b6462209c15a8b::crystalrohr_protocol::Video>",
        },
      ],
    },
    {
      name: "Video",
      is_native: false,
      is_event: false,
      abilities: ["copy", "drop", "store"],
      generic_type_params: [],
      fields: [
        {
          name: "ipfs_hash",
          type: "0x1::string::String",
        },
        {
          name: "user_address",
          type: "address",
        },
        {
          name: "node_proof",
          type: "0x19d8e370ccb0e6f391a168dc53619d51f3dee52cc429c41ca9b6462209c15a8b::crystalrohr_protocol::NodeProof",
        },
      ],
    },
    {
      name: "VideoCaptionCompleted",
      is_native: false,
      is_event: true,
      abilities: ["drop", "store"],
      generic_type_params: [],
      fields: [
        {
          name: "user_address",
          type: "address",
        },
        {
          name: "ipfs_hash",
          type: "0x1::string::String",
        },
        {
          name: "node_address",
          type: "address",
        },
        {
          name: "caption",
          type: "0x1::string::String",
        },
      ],
    },
    {
      name: "VideoCaptionRequested",
      is_native: false,
      is_event: true,
      abilities: ["drop", "store"],
      generic_type_params: [],
      fields: [
        {
          name: "user_address",
          type: "address",
        },
        {
          name: "ipfs_hash",
          type: "0x1::string::String",
        },
        {
          name: "node_address",
          type: "address",
        },
      ],
    },
  ],
} as const;

export default data;

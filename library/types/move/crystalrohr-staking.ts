const data = {
  address: "0x19d8e370ccb0e6f391a168dc53619d51f3dee52cc429c41ca9b6462209c15a8b",
  name: "crystalrohr_staking",
  friends: [
    "0x19d8e370ccb0e6f391a168dc53619d51f3dee52cc429c41ca9b6462209c15a8b::crystalrohr_protocol",
  ],
  exposed_functions: [
    {
      name: "claim_rewards",
      visibility: "friend",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "u64"],
      return: [],
    },
    {
      name: "stake",
      visibility: "friend",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "u64"],
      return: [],
    },
    {
      name: "staked_amount",
      visibility: "friend",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["address"],
      return: ["u64"],
    },
    {
      name: "unstake",
      visibility: "friend",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "u64"],
      return: [],
    },
    {
      name: "valid_staker",
      visibility: "friend",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["address"],
      return: ["bool"],
    },
  ],
  structs: [
    {
      name: "StakedBalance",
      is_native: false,
      is_event: false,
      abilities: ["key"],
      generic_type_params: [],
      fields: [
        {
          name: "staked_balance",
          type: "u64",
        },
      ],
    },
  ],
} as const;

export default data;

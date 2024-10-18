const data = {
  address: "0x19d8e370ccb0e6f391a168dc53619d51f3dee52cc429c41ca9b6462209c15a8b",
  name: "rohr",
  friends: [
    "0x19d8e370ccb0e6f391a168dc53619d51f3dee52cc429c41ca9b6462209c15a8b::crystalrohr_protocol",
    "0x19d8e370ccb0e6f391a168dc53619d51f3dee52cc429c41ca9b6462209c15a8b::crystalrohr_staking",
  ],
  exposed_functions: [
    {
      name: "burn",
      visibility: "friend",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["address", "u64"],
      return: [],
    },
    {
      name: "get_metadata",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [],
      return: ["0x1::object::Object<0x1::fungible_asset::Metadata>"],
    },
    {
      name: "mint",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["address", "u64"],
      return: [],
    },
  ],
  structs: [
    {
      name: "AssetPermissions",
      is_native: false,
      is_event: false,
      abilities: ["key"],
      generic_type_params: [],
      fields: [
        {
          name: "mint_ref",
          type: "0x1::fungible_asset::MintRef",
        },
        {
          name: "burn_ref",
          type: "0x1::fungible_asset::BurnRef",
        },
      ],
    },
  ],
} as const;

export default data;

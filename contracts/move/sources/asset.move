module crystalrohr::rohr {
    use std::option;
    use std::string::utf8;
    use aptos_framework::fungible_asset::{Self, MintRef, BurnRef, Metadata};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;

    friend crystalrohr::crystalrohr_staking;
    friend crystalrohr::crystalrohr_protocol;

    const ENOT_OWNER: u64 = 1;

    const ASSET_SYMBOL: vector<u8> = b"ROHR";

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct AssetPermissions has key {
        mint_ref: MintRef,
        burn_ref: BurnRef,
    }

    fun init_module(admin: &signer) {
        let constructor_ref = &object::create_named_object(admin, ASSET_SYMBOL);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            utf8(b"Rohr Coin"),
            utf8(ASSET_SYMBOL),
            8,
            utf8(b"https://www.crystalrohr.com/icon.png"),
            utf8(b"https://www.crystalrohr.com"),
        );

        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        let metadata_object_signer = object::generate_signer(constructor_ref);
        move_to(
            &metadata_object_signer,
            AssetPermissions { mint_ref, burn_ref }
        );
    }

    #[view]
    public fun get_metadata(): Object<Metadata> {
        let asset_address = object::create_object_address(&@crystalrohr, ASSET_SYMBOL);
        object::address_to_object<Metadata>(asset_address)
    }

    public entry fun mint(recipient: address, amount: u64) acquires AssetPermissions {
        let asset = get_metadata();
        let mint_ref = &borrow_asset_permissions(asset).mint_ref;
        let recipient_store = primary_fungible_store::ensure_primary_store_exists(recipient, asset);
        let minted_asset = fungible_asset::mint(mint_ref, amount);
        fungible_asset::deposit(recipient_store, minted_asset);
    }

    public(friend) fun burn(from: address, amount: u64) acquires AssetPermissions {
        let asset = get_metadata();
        let burn_ref = &borrow_asset_permissions(asset).burn_ref;
        let from_store = primary_fungible_store::primary_store(from, asset);
        fungible_asset::burn_from(burn_ref, from_store, amount);
    }

    inline fun borrow_asset_permissions(asset: Object<Metadata>): &AssetPermissions acquires AssetPermissions {
        borrow_global<AssetPermissions>(object::object_address(&asset))
    }


    #[test_only]
    use std::signer;

    #[test_only]
    public fun initialize_for_testing(admin: &signer) {
        init_module(admin)
    }

    #[test(creator = @crystalrohr)]
    fun test_basic_flow(creator: &signer) acquires AssetPermissions {
        init_module(creator);
        let creator_address = signer::address_of(creator);
        let test_recipient = @0xface;

        mint(creator_address, 100);
        let asset = get_metadata();
        assert!(primary_fungible_store::balance(creator_address, asset) == 100, 4);
        mint(test_recipient, 50);
        assert!(primary_fungible_store::balance(test_recipient, asset) == 50, 5);
        burn(creator_address, 30);
        assert!(primary_fungible_store::balance(creator_address, asset) == 70, 6);
    }

    #[test(admin = @crystalrohr)]
    fun test_init_module(admin: &signer) {
        init_module(admin);
        let metadata = get_metadata();
        assert!(fungible_asset::symbol(metadata) == utf8(b"ROHR"), 0);
    }

    #[test(admin = @crystalrohr)]
    fun test_get_metadata(admin: &signer) {
        init_module(admin);
        let metadata = get_metadata();
        assert!(fungible_asset::name(metadata) == utf8(b"Rohr Coin"), 0);
    }

    #[test(admin = @crystalrohr, recipient = @0x123)]
    fun test_mint(admin: &signer, recipient: &signer) acquires AssetPermissions {
        init_module(admin);
        let recipient_addr = signer::address_of(recipient);
        mint(recipient_addr, 100);
        let balance = primary_fungible_store::balance(recipient_addr, get_metadata());
        assert!(balance == 100, 0);
    }

    #[test(admin = @crystalrohr, user = @0x123)]
    fun test_burn(admin: &signer, user: &signer) acquires AssetPermissions {
        init_module(admin);
        let user_addr = signer::address_of(user);
        mint(user_addr, 100);
        burn(user_addr, 50);
        let balance = primary_fungible_store::balance(user_addr, get_metadata());
        assert!(balance == 50, 0);
    }

    #[test(admin = @crystalrohr, user = @0x123)]
    fun test_mint_and_burn_flow(admin: &signer, user: &signer) acquires AssetPermissions {
        init_module(admin);
        let user_addr = signer::address_of(user);
        mint(user_addr, 100);
        burn(user_addr, 30);
        let balance = primary_fungible_store::balance(user_addr, get_metadata());
        assert!(balance == 70, 0);
    }

    #[test(admin = @crystalrohr, user = @0x123)]
    #[expected_failure]
    fun test_burn_insufficient_balance(admin: &signer, user: &signer) acquires AssetPermissions {
        init_module(admin);
        let user_addr = signer::address_of(user);
        mint(user_addr, 50);
        burn(user_addr, 100);
    }
}
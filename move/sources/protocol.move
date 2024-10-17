module crystalrohr::crystalrohr_protocol {
    use std::signer;
    use std::string;
    use std::option::{Self, Option};
    use aptos_std::smart_vector::{Self, SmartVector};
    use aptos_framework::randomness;
    use crystalrohr::rohr;
    use crystalrohr::crystalrohr_staking;

    /// Error codes
    const ENODE_NOT_REGISTERED: u64 = 0;
    const EINVALID_VIDEO_HASH: u64 = 1;
    const ENEVER_STAKED: u64 = 2;
    const ENODE_NOT_ACTIVE: u64 = 3;
    const ENODE_ALREADY_ACTIVE: u64 = 4;
    const ENODE_UNAVAILABLE: u64 = 5;

    /// The video operation amount, in ROHR ~ 1.
    const VIDEO_OP_PRICE: u64 = 100_000_000;

    struct ProtocolPool has key {
        active: SmartVector<address>,
    }

    struct User has key, store {
        video: Option<Video>,
    }

    struct Video has copy, drop, store {
        ipfs_hash: string::String,
        user_address: address,
        node_proof: NodeProof,
    }

    struct NodeProof has copy, drop, store {
        node_address: address,
        caption: Option<string::String>,
    }

    struct Node has key {
        operation_proofs: u64,
        pending_task: bool,
        task_address: Option<address>,
    }

    /// Initialize the module
    /// This function is called only once when the module is published
    fun init_module(deployer: &signer) {
        move_to(
            deployer, 
            ProtocolPool {
                active: smart_vector::empty(),
            }
        );
    }

    fun stake_multiplier_reset(node_address: address): u64 acquires Node {
        let node_state = borrow_global_mut<Node>(node_address);
        let original_op_proofs = node_state.operation_proofs;

        // Reset op proofs count
        node_state.operation_proofs = 0;

        // Return the original value as reward multiplier numerator
        original_op_proofs
    }

    fun join_pool_internal(node_address: address) acquires ProtocolPool {
        let pool = borrow_global_mut<ProtocolPool>(@crystalrohr);
        assert!(valid_staker(node_address), ENEVER_STAKED);
        smart_vector::push_back(&mut pool.active, node_address);
    }

    fun randomly_pick_address_internal(): address acquires ProtocolPool {
        let pool = borrow_global_mut<ProtocolPool>(@crystalrohr);
        let available_addresses = &mut pool.active;
        let total_stake = 0u64;

        if (smart_vector::length(available_addresses) == 0) {
            abort(ENODE_UNAVAILABLE)
        };

        // Calculate the total stake
        let i = 0;
        while (i < smart_vector::length(available_addresses)) {
            let address = *smart_vector::borrow(available_addresses, i);
            total_stake = total_stake + staked_amount(address);
            i = i + 1;
        };

        // Generate a random number between [1, total_stake]
        let random_stake = randomness::u64_range(1, total_stake);
        let cursor = 0;
        let k = 0;
        let selected_address = @crystalrohr; // Default value, will be overwritten

        while (k < smart_vector::length(available_addresses)) {
            let address = *smart_vector::borrow(available_addresses, k);
            let stake_amount = staked_amount(address);
            cursor = cursor + stake_amount;
            if (cursor >= random_stake) {
                selected_address = address;
                smart_vector::remove(available_addresses, k);
                break
            };
            k = k + 1;
        };

        selected_address
    }

    #[view]
    public fun valid_staker(node_address: address): bool {
        crystalrohr_staking::valid_staker(node_address)
    }

    #[view]
    public fun staked_amount(node_address: address): u64 {
        crystalrohr_staking::staked_amount(node_address)
    }

    public entry fun stake(node_account: &signer, amount: u64) {
        crystalrohr_staking::stake(node_account, amount)
    }

    public entry fun unstake(node_account: &signer, amount: u64) {
        crystalrohr_staking::unstake(node_account, amount)
    }

    public entry fun claim_rewards(node_account: &signer) acquires Node {
        let node_address = signer::address_of(node_account);
        let reward_numerator = stake_multiplier_reset(node_address);
        crystalrohr_staking::claim_rewards(node_account, reward_numerator)
    }

    public entry fun join_pool(node_account: &signer) acquires Node, ProtocolPool {
        let node_address = signer::address_of(node_account);

        if (!exists<Node>(node_address)) {
            move_to(
                node_account,
                Node {
                    operation_proofs: 0,
                    pending_task: false,
                    task_address: option::none(),
                }
            )
        };

        let pending_task = &borrow_global<Node>(node_address).pending_task;
        assert!(!*pending_task, ENODE_ALREADY_ACTIVE);
        join_pool_internal(node_address);
    }

    #[randomness]
    entry fun caption_video(user_account: &signer, ipfs_hash: string::String) acquires User, Node, ProtocolPool {
        assert!(!string::is_empty(&ipfs_hash), EINVALID_VIDEO_HASH);
        let user_address = signer::address_of(user_account);
        rohr::burn(user_address, VIDEO_OP_PRICE);

        if (!exists<User>(user_address)) {
            move_to(
                user_account,
                User {
                    video: option::none(),
                }
            )
        };

        let selected_node = randomly_pick_address_internal();

        // Update the Node with the details of their current task.
        let node_state = borrow_global_mut<Node>(selected_node);
        node_state.pending_task = true;
        node_state.task_address = option::some(user_address);

        // Instantiate the proof.
        let node_proof = NodeProof {
            node_address: selected_node,
            caption: option::none(),
        };

        let user_video = &mut borrow_global_mut<User>(user_address).video;
        let video = Video {
            ipfs_hash,
            user_address,
            node_proof,
        };
        *user_video = option::some(video);
    }

    public entry fun complete_caption_video(node_account: &signer, caption: string::String) acquires Node, User, ProtocolPool {
        let node_address = signer::address_of(node_account);
        assert!(exists<Node>(node_address), ENODE_NOT_REGISTERED);
        let node_state = borrow_global_mut<Node>(node_address);
        assert!(node_state.pending_task, ENODE_NOT_ACTIVE);
        
        // Update the video with the caption
        let task_address = *option::borrow(&node_state.task_address);
        let user_video = &mut borrow_global_mut<User>(task_address).video;
        if (option::is_some(user_video)) {
            let video = option::borrow_mut(user_video);
            video.node_proof.caption = option::some(caption);
        };
        
        // Update node state
        node_state.operation_proofs = node_state.operation_proofs + 1;
        node_state.pending_task = false;
        node_state.task_address = option::none();
        
        // Call join_pool_internal to make the node available for new tasks
        join_pool_internal(node_address);
    }

    const MIN_STAKE: u64 = 100_000_000;

    #[test(deployer = @crystalrohr)]
    fun test_init_module(deployer: &signer) {
        init_module(deployer);
        assert!(exists<ProtocolPool>(signer::address_of(deployer)), 0);
    }

    #[test(aptos_framework = @aptos_framework, admin = @crystalrohr, user = @0x123, node = @0x456)]
    fun test_stake_multiplier_reset(aptos_framework: &signer, admin: &signer, user: &signer, node: &signer) acquires Node, ProtocolPool, User {
        rohr::initialize_for_testing(admin);
        randomness::initialize_for_testing(aptos_framework);
        init_module(admin);

        let user_addr = signer::address_of(user);
        let node_addr = signer::address_of(node);

        // Mint and stake
        rohr::mint(user_addr, VIDEO_OP_PRICE);
        rohr::mint(node_addr, MIN_STAKE);
        crystalrohr_staking::stake(node, MIN_STAKE);
        
        // caption ops
        join_pool(node);
        caption_video(user, string::utf8(b"test_hash"));
        complete_caption_video(node, string::utf8(b"Test caption"));

        let node_state = borrow_global_mut<Node>(node_addr);
        let operation_proofs1 = node_state.operation_proofs;

        let multiplier = stake_multiplier_reset(node_addr);

        let node_state = borrow_global_mut<Node>(node_addr);
        let operation_proofs2 = node_state.operation_proofs;

        assert!(operation_proofs1 == multiplier, 0);
        assert!(operation_proofs2 == 0, 0);
    }

    #[test(admin = @crystalrohr, node = @0x123)]
    fun test_join_pool(admin: &signer, node: &signer) acquires Node, ProtocolPool {
        rohr::initialize_for_testing(admin);
        init_module(admin);

        // Mint and stake
        let node_addr = signer::address_of(node);
        rohr::mint(node_addr, MIN_STAKE);

        crystalrohr_staking::stake(node, MIN_STAKE);
        join_pool(node);

        let pool = borrow_global_mut<ProtocolPool>(@crystalrohr);
        assert!(smart_vector::length(&mut pool.active) == 1, 0);
    }

    #[test(aptos_framework = @aptos_framework, admin = @crystalrohr, node1 = @0x123, node2 = @0x456)]
    fun test_randomly_pick_address(aptos_framework: &signer, admin: &signer, node1: &signer, node2: &signer) acquires Node, ProtocolPool {
        rohr::initialize_for_testing(admin);
        randomness::initialize_for_testing(aptos_framework);
        init_module(admin);

        let node1_addr = signer::address_of(node1);
        let node2_addr = signer::address_of(node2);

        // Mint and stake
        rohr::mint(node1_addr, MIN_STAKE);
        rohr::mint(node2_addr, MIN_STAKE);
        crystalrohr_staking::stake(node1, MIN_STAKE);
        crystalrohr_staking::stake(node2, MIN_STAKE);

        join_pool(node1);
        join_pool(node2);

        let selected = randomly_pick_address_internal();
        assert!(selected == node1_addr || selected == node2_addr, 0);
    }

    #[test(aptos_framework = @aptos_framework, admin = @crystalrohr, user = @0x123, node = @0x456)]
    fun test_caption_video(aptos_framework: &signer, admin: &signer, user: &signer, node: &signer) acquires Node, User, ProtocolPool {
        rohr::initialize_for_testing(admin);
        randomness::initialize_for_testing(aptos_framework);
        init_module(admin);

        let user_addr = signer::address_of(user);
        let node_addr = signer::address_of(node);

        // Mint and stake
        rohr::mint(user_addr, VIDEO_OP_PRICE);
        rohr::mint(node_addr, MIN_STAKE);
        crystalrohr_staking::stake(node, MIN_STAKE);

        let hash = string::utf8(b"test_hash");

        join_pool(node);
        caption_video(user, hash);
    
        let user_video = borrow_global_mut<User>(user_addr).video;
        assert!(option::is_some(&user_video), 0);
        let video = option::borrow(&user_video);
        assert!(video.ipfs_hash == hash, 1)
    }

    #[test(aptos_framework = @aptos_framework, admin = @crystalrohr, user = @0x123, node = @0x456)]
    fun test_complete_caption_video(aptos_framework: &signer, admin: &signer, user: &signer, node: &signer) acquires Node, User, ProtocolPool {
        rohr::initialize_for_testing(admin);
        randomness::initialize_for_testing(aptos_framework);
        init_module(admin);

        let user_addr = signer::address_of(user);
        let node_addr = signer::address_of(node);

        // Mint and stake
        rohr::mint(user_addr, VIDEO_OP_PRICE);
        rohr::mint(node_addr, MIN_STAKE);
        crystalrohr_staking::stake(node, MIN_STAKE);

        let caption = string::utf8(b"Test caption");

        join_pool(node);
        caption_video(user, string::utf8(b"test_hash"));
        complete_caption_video(node, caption);

        let user_video = borrow_global_mut<User>(user_addr).video;
        assert!(option::is_some(&user_video), 0);
        let video = option::borrow(&user_video);
        assert!(video.node_proof.caption == option::some(caption), 1);
    }

    #[test(aptos_framework = @aptos_framework, admin = @crystalrohr, user = @0x123, node = @0x456)]
    #[expected_failure(abort_code = ENODE_ALREADY_ACTIVE)]
    fun test_join_pool_already_active(aptos_framework: &signer, admin: &signer, user: &signer, node: &signer) acquires User, Node, ProtocolPool {
        rohr::initialize_for_testing(admin);
        randomness::initialize_for_testing(aptos_framework);
        init_module(admin);

        let user_addr = signer::address_of(user);
        let node_addr = signer::address_of(node);

        // Mint and stake
        rohr::mint(user_addr, VIDEO_OP_PRICE);
        rohr::mint(node_addr, MIN_STAKE);
        crystalrohr_staking::stake(node, MIN_STAKE);

        join_pool(node);
        caption_video(user, string::utf8(b"test_hash"));
        join_pool(node); // Should fail
    }

    #[test(aptos_framework = @aptos_framework, admin = @crystalrohr, user = @0x123)]
    #[expected_failure]
    fun test_caption_video_insufficient_balance(aptos_framework: &signer, admin: &signer, user: &signer) acquires Node, User, ProtocolPool {
        rohr::initialize_for_testing(admin);
        randomness::initialize_for_testing(aptos_framework);
        init_module(admin);
        let user_addr = signer::address_of(user);
        rohr::mint(user_addr, VIDEO_OP_PRICE - 1); // Not enough ROHR
        caption_video(user, string::utf8(b"test_hash"));
    }

    #[test(aptos_framework = @aptos_framework, admin = @crystalrohr, user = @0x123, node = @0x456)]
    #[expected_failure(abort_code = ENODE_UNAVAILABLE)]
    fun test_complete_caption_video_node_unavailable(aptos_framework: &signer, admin: &signer, user: &signer) acquires Node, User, ProtocolPool {
        rohr::initialize_for_testing(admin);
        randomness::initialize_for_testing(aptos_framework);
        init_module(admin);
        let user_addr = signer::address_of(user);
        rohr::mint(user_addr, VIDEO_OP_PRICE);
        caption_video(user, string::utf8(b"test_hash"));
    }

    #[test(aptos_framework = @aptos_framework, admin = @crystalrohr, user = @0x123, node1 = @0x456, node2= @0x789)]
    #[expected_failure(abort_code = ENODE_NOT_REGISTERED)]
    fun test_complete_caption_video_node_not_registered(aptos_framework: &signer, admin: &signer, user: &signer, node1: &signer, node2: &signer) acquires Node, User, ProtocolPool {
        rohr::initialize_for_testing(admin);
        randomness::initialize_for_testing(aptos_framework);
        init_module(admin);

        let user_addr = signer::address_of(user);
        let node_addr1 = signer::address_of(node1);

        // Mint and stake
        rohr::mint(user_addr, VIDEO_OP_PRICE);
        rohr::mint(node_addr1, MIN_STAKE);
        crystalrohr_staking::stake(node1, MIN_STAKE);

        join_pool(node1); // Node1 Join pool to not trigger ENODE_UNAVAILABLE

        caption_video(user, string::utf8(b"test_hash"));
        complete_caption_video(node2, string::utf8(b"Test caption")); // Node2 not in pool
    }

    #[test(admin = @crystalrohr, user = @0x123, node = @0x456)]
    #[expected_failure(abort_code = ENODE_NOT_ACTIVE)]
    fun test_complete_caption_video_not_active(admin: &signer, user: &signer, node: &signer) acquires Node, User, ProtocolPool {
        rohr::initialize_for_testing(admin);
        init_module(admin);
        let user_addr = signer::address_of(user);
        let node_addr = signer::address_of(node);
        rohr::mint(user_addr, VIDEO_OP_PRICE);
        rohr::mint(node_addr, MIN_STAKE);
        crystalrohr_staking::stake(node, MIN_STAKE);
        join_pool(node);
        // Node is active but hasn't been assigned a task
        complete_caption_video(node, string::utf8(b"Test caption"));
    }

    #[test(aptos_framework = @aptos_framework, admin = @crystalrohr, user = @0x123, node = @0x456)]
    fun test_full_video_captioning_flow(aptos_framework: &signer, admin: &signer, user: &signer, node: &signer) acquires Node, User, ProtocolPool {
        rohr::initialize_for_testing(admin);
        randomness::initialize_for_testing(aptos_framework);
        init_module(admin);
        let user_addr = signer::address_of(user);
        let node_addr = signer::address_of(node);
        
        // Mint and stake
        rohr::mint(user_addr, VIDEO_OP_PRICE);
        rohr::mint(node_addr, MIN_STAKE);
        crystalrohr_staking::stake(node, MIN_STAKE);
        
        join_pool(node);
        caption_video(user, string::utf8(b"test_hash"));
        complete_caption_video(node, string::utf8(b"Test caption"));
    }
}

 
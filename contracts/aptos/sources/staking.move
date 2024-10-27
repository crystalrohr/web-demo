module crystalrohr::crystalrohr_staking {
    use std::signer;
    use crystalrohr::rohr;

    friend crystalrohr::crystalrohr_protocol;

    /// Error codes
    const EINSUFFICIENT_STAKE: u64 = 0;
    const ENEVER_STAKED: u64 = 1;
    const EINVALID_UNSTAKE_AMOUNT: u64 = 2;

    /// The reward multiplier is op_proof / denominator.
    const OPERATION_PROOFS_DENOMINATOR:u64 = 10;

    /// The minimum amount a node can stake, in ROHR ~ 1.
    const MIN_STAKE: u64 = 100_000_000;

    struct StakedBalance has key {
        staked_balance: u64,
    }

    public(friend) fun stake(staker_account: &signer, amount: u64) acquires StakedBalance {
        let staker_address = signer::address_of(staker_account);
        assert!(amount >= MIN_STAKE, EINSUFFICIENT_STAKE);
        if (!exists<StakedBalance>(staker_address)){
            move_to(
                staker_account, 
                StakedBalance {
                    staked_balance: amount,
                }
            );
        } else {
            let staked_balance = &mut borrow_global_mut<StakedBalance>(staker_address).staked_balance;
            *staked_balance = *staked_balance + amount;
        };
        rohr::burn(staker_address, amount);
    }

    public(friend) fun unstake(staker_account: &signer, amount: u64) acquires StakedBalance {
        let staker_address = signer::address_of(staker_account);
        assert!(exists<StakedBalance>(staker_address), ENEVER_STAKED);
        let staked_balance = &mut borrow_global_mut<StakedBalance>(staker_address).staked_balance;
        assert!(*staked_balance >= amount, EINVALID_UNSTAKE_AMOUNT);
        *staked_balance = *staked_balance - amount;
        rohr::mint(staker_address, amount);
    }

    public(friend) fun claim_rewards(staker_account: &signer, reward_numerator: u64) acquires StakedBalance {
        let staker_address = signer::address_of(staker_account);
        assert!(exists<StakedBalance>(staker_address), ENEVER_STAKED);
        let staked_balance = &borrow_global<StakedBalance>(staker_address).staked_balance;
        assert!(*staked_balance > 0, EINSUFFICIENT_STAKE);
        let opd = OPERATION_PROOFS_DENOMINATOR;
        let reward_amount = (*staked_balance * reward_numerator) / (opd);
        rohr::mint(staker_address, reward_amount);
    }

    public(friend) fun valid_staker(staker_address: address): bool acquires StakedBalance {
        if (!exists<StakedBalance>(staker_address)) {
            return false
        };

        let staked_amount = borrow_global<StakedBalance>(staker_address).staked_balance;
        staked_amount >= MIN_STAKE
    }

    public(friend) fun staked_amount(staker_address: address): u64 acquires StakedBalance {
        if (!exists<StakedBalance>(staker_address)) {
            return 0
        };
        
        borrow_global<StakedBalance>(staker_address).staked_balance
    }

    #[test_only]
    use aptos_framework::primary_fungible_store;

    #[test(admin = @crystalrohr, staker = @0x123)]
    fun test_stake(admin: &signer, staker: &signer) acquires StakedBalance {
        rohr::initialize_for_testing(admin);
        let staker_addr = signer::address_of(staker);
        rohr::mint(staker_addr, MIN_STAKE);
        stake(staker, MIN_STAKE);
        assert!(staked_amount(staker_addr) == MIN_STAKE, 0);
    }

    #[test(admin = @crystalrohr, staker = @0x123)]
    fun test_unstake(admin: &signer, staker: &signer) acquires StakedBalance {
        rohr::initialize_for_testing(admin);
        let staker_addr = signer::address_of(staker);
        rohr::mint(staker_addr, MIN_STAKE * 2);
        stake(staker, MIN_STAKE * 2);
        unstake(staker, MIN_STAKE);
        assert!(staked_amount(staker_addr) == MIN_STAKE, 0);
    }

    #[test(admin = @crystalrohr, staker = @0x123)]
    fun test_claim_rewards(admin: &signer, staker: &signer) acquires StakedBalance {
        rohr::initialize_for_testing(admin);
        let staker_addr = signer::address_of(staker);
        let stake = MIN_STAKE;
        rohr::mint(staker_addr, stake);
        stake(staker, stake);
        let reward_numerator = 10; // Assume 10 operation proofs
        claim_rewards(staker, reward_numerator); 
        let opd = OPERATION_PROOFS_DENOMINATOR;
        let reward_amount = (stake * reward_numerator) / (opd);
        let balance = primary_fungible_store::balance(staker_addr, rohr::get_metadata());
        assert!(balance == reward_amount, 0);
    }

    #[test(admin = @crystalrohr, staker = @0x123)]
    fun test_valid_staker(admin: &signer, staker: &signer) acquires StakedBalance {
        rohr::initialize_for_testing(admin);
        let staker_addr = signer::address_of(staker);
        rohr::mint(staker_addr, MIN_STAKE);
        stake(staker, MIN_STAKE);
        assert!(valid_staker(staker_addr), 0);
    }

    #[test(admin = @crystalrohr, staker = @0x123)]
    fun test_staked_amount(admin: &signer, staker: &signer) acquires StakedBalance {
        rohr::initialize_for_testing(admin);
        let staker_addr = signer::address_of(staker);
        rohr::mint(staker_addr, MIN_STAKE * 2);
        stake(staker, MIN_STAKE * 2);
        assert!(staked_amount(staker_addr) == MIN_STAKE * 2, 0);
    }

    #[test(admin = @crystalrohr, staker = @0x123)]
    #[expected_failure(abort_code = EINSUFFICIENT_STAKE)]
    fun test_stake_below_minimum(admin: &signer, staker: &signer) acquires StakedBalance {
        rohr::initialize_for_testing(admin);
        let staker_addr = signer::address_of(staker);
        rohr::mint(staker_addr, MIN_STAKE - 1);
        stake(staker, MIN_STAKE - 1);
    }

    #[test(admin = @crystalrohr, staker = @0x123)]
    #[expected_failure(abort_code = EINVALID_UNSTAKE_AMOUNT)]
    fun test_unstake_more_than_staked(admin: &signer, staker: &signer) acquires StakedBalance {
        rohr::initialize_for_testing(admin);
        let staker_addr = signer::address_of(staker);
        rohr::mint(staker_addr, MIN_STAKE);
        stake(staker, MIN_STAKE);
        unstake(staker, MIN_STAKE + 1);
    }

    #[test(admin = @crystalrohr, staker = @0x123)]
    #[expected_failure(abort_code = ENEVER_STAKED)]
    fun test_claim_rewards_with_zero_balance(admin: &signer, staker: &signer) acquires StakedBalance {
        rohr::initialize_for_testing(admin);
        claim_rewards(staker, 10);
    }

    #[test(admin = @crystalrohr, staker = @0x123)]
    fun test_stake_unstake_flow(admin: &signer, staker: &signer) acquires StakedBalance {
        rohr::initialize_for_testing(admin);
        let staker_addr = signer::address_of(staker);
        rohr::mint(staker_addr, MIN_STAKE * 2);
        stake(staker, MIN_STAKE * 2);
        unstake(staker, MIN_STAKE);
        assert!(staked_amount(staker_addr) == MIN_STAKE, 0);
        assert!(valid_staker(staker_addr), 1);
    }
}
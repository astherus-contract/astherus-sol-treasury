pub mod init;
pub mod token;
pub mod deposit;
pub mod withdraw;
pub mod errors;
pub mod events;
pub mod utils;
pub mod constants;
pub mod sol;

use anchor_lang::prelude::*;
use crate::init::*;
use crate::deposit::*;
use crate::withdraw::*;
use crate::token::*;
use crate::sol::*;


declare_id!("B3QEkbi6b6AAvXgUqpeWXBExVKYFEfU9psDqRdSgD76W");

#[program]
pub mod cloud_sol_treasury {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, withdraw_enabled: bool, hourly_limit: u64, operator: Pubkey, counter_party: Pubkey, truth_holder: Pubkey, price_feed_program: Pubkey, remove_claim_history: Pubkey) -> Result<()> {
        return init::initialize(ctx, withdraw_enabled, hourly_limit, operator, counter_party, truth_holder, price_feed_program, remove_claim_history);
    }

    pub fn update_global_withdraw_enabled(ctx: Context<UpdateAdmin>, global_withdraw_enabled: bool) -> Result<()> {
        return init::update_global_withdraw_enabled(ctx, global_withdraw_enabled);
    }

    pub fn update_hourly_limit(ctx: Context<UpdateAdmin>, hourly_limit: u64) -> Result<()> {
        return init::update_hourly_limit(ctx, hourly_limit);
    }

    pub fn change_operator(ctx: Context<UpdateAdmin>, operator: Pubkey) -> Result<()> {
        return init::change_operator(ctx, operator);
    }

    pub fn change_counter_party(ctx: Context<UpdateAdmin>, counter_party: Pubkey) -> Result<()> {
        return init::change_counter_party(ctx, counter_party);
    }

    pub fn change_truth_holder(ctx: Context<UpdateAdmin>, truth_holder: Pubkey) -> Result<()> {
        return init::change_truth_holder(ctx, truth_holder);
    }

    pub fn change_authority(ctx: Context<UpdateAdmin>, authority: Pubkey) -> Result<()> {
        return init::change_authority(ctx, authority);
    }

    pub fn change_price_feed_program(ctx: Context<UpdateAdmin>, price_feed_program: Pubkey) -> Result<()> {
        return init::change_price_feed_program(ctx, price_feed_program);
    }

    pub fn change_remove_claim_history(ctx: Context<UpdateAdmin>, remove_claim_history: Pubkey) -> Result<()> {
        return init::change_remove_claim_history(ctx, remove_claim_history);
    }

    pub fn add_sol(ctx: Context<AddSol>, enabled: bool, sol_vault_bump: u8, price: u64, fixed_price: bool, price_decimals: u8, token_decimals: u8) -> Result<()> {
        return sol::add_sol(ctx, enabled, sol_vault_bump, price, fixed_price, price_decimals, token_decimals);
    }

    pub fn update_sol_enabled(ctx: Context<UpdateSolEnabled>, enabled: bool) -> Result<()> {
        return sol::update_sol_enabled(ctx, enabled);
    }

    pub fn remove_sol_claim_history(ctx: Context<RemoveSolClaimHistory>, index_str: String) -> Result<()> {
        return sol::remove_sol_claim_history(ctx, index_str);
    }

    pub fn add_token(ctx: Context<AddToken>, enabled: bool, token_vault_authority_bump: u8, price: u64, fixed_price: bool, price_decimals: u8, token_decimals: u8) -> Result<()> {
        return token::add_token(ctx, enabled, token_vault_authority_bump, price, fixed_price, price_decimals, token_decimals);
    }

    pub fn update_token_enabled(ctx: Context<UpdateTokenEnabled>, enabled: bool) -> Result<()> {
        return token::update_token_enabled(ctx, enabled);
    }

    pub fn remove_token_claim_history(ctx: Context<RemoveTokenClaimHistory>, index_str: String) -> Result<()> {
        return token::remove_token_claim_history(ctx, index_str);
    }

    pub fn deposit_sol(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
        return deposit::deposit_sol(ctx, amount);
    }

    pub fn deposit_token(ctx: Context<DepositToken>, amount: u64) -> Result<()> {
        return deposit::deposit_token(ctx, amount);
    }

    pub fn withdraw_sol_by_signature(ctx: Context<WithdrawSolBySignature>, amount: u64, dead_line: u32, idempotent: u64, signature: [u8; 64]) -> Result<()> {
        return withdraw::withdraw_sol_by_signature(ctx, amount, dead_line, idempotent, signature);
    }

    pub fn withdraw_sol_to_counter_party(ctx: Context<WithdrawSolToCounterParty>, amount: u64) -> Result<()> {
        return withdraw::withdraw_sol_to_counter_party(ctx, amount);
    }

    pub fn withdraw_token_by_signature(ctx: Context<WithdrawTokenBySignature>, amount: u64, dead_line: u32, idempotent: u64, signature: [u8; 64]) -> Result<()> {
        return withdraw::withdraw_token_by_signature(ctx, amount, dead_line, idempotent, signature);
    }

    pub fn withdraw_token_to_counter_party(ctx: Context<WithdrawTokenToCounterParty>, amount: u64) -> Result<()> {
        return withdraw::withdraw_token_to_counter_party(ctx, amount);
    }
}






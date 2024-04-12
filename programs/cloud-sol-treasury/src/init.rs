use anchor_lang::{prelude::*};

use crate::errors::ErrorCode;
use crate::events::*;
use crate::constants;


pub fn initialize(ctx: Context<Initialize>, global_withdraw_enabled: bool,sol_vault_bump: u8, hourly_limit: u64,
                  operator: Pubkey, counter_party: Pubkey, truth_holder: Pubkey, price_feed_program: Pubkey) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_init()?;
    require!(!admin.init, ErrorCode::AlreadyInitialized);
    admin.init = true;
    admin.global_withdraw_enabled = global_withdraw_enabled;
    admin.hourly_limit = hourly_limit;
    admin.authority = *ctx.accounts.signer.key;
    admin.operator = operator;
    admin.counter_party = counter_party;
    admin.truth_holder = truth_holder;
    admin.price_feed_program = price_feed_program;
    admin.sol_vault_bump = sol_vault_bump;
    emit!(InitializeEvent{
        init : true,
        global_withdraw_enabled : global_withdraw_enabled,
        hourly_limit : hourly_limit,
        authority : *ctx.accounts.signer.key,
        operator : operator,
        counter_party : counter_party,
        truth_holder : truth_holder,
        price_feed_program:price_feed_program
    });

    Ok(())
}

pub fn update_global_withdraw_enabled(ctx: Context<UpdateAdmin>, global_withdraw_enabled: bool) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_mut()?;
    let old_global_withdraw_enabled = admin.global_withdraw_enabled;
    admin.global_withdraw_enabled = global_withdraw_enabled;

    emit!(UpdateWithdrawEnabledEvent{
        old_global_withdraw_enabled : old_global_withdraw_enabled,
        new_global_withdraw_enabled : global_withdraw_enabled,
    });

    Ok(())
}

pub fn update_hourly_limit(ctx: Context<UpdateAdmin>, hourly_limit: u64) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_mut()?;
    let old_hourly_limit = admin.hourly_limit;
    admin.hourly_limit = hourly_limit;

    emit!(UpdateHourlyLimitEvent{
        old_hourly_limit : old_hourly_limit,
        new_hourly_limit:hourly_limit
    });

    Ok(())
}

pub fn change_operator(ctx: Context<UpdateAdmin>, operator: Pubkey) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_mut()?;
    let old_operator = admin.operator;
    admin.operator = operator;
    emit!(ChangeOperatorEvent{
        old_operator : old_operator,
        new_operator:operator
    });

    Ok(())
}

pub fn change_counter_party(ctx: Context<UpdateAdmin>, counter_party: Pubkey) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_mut()?;
    let old_counter_party = admin.counter_party;
    admin.counter_party = counter_party;

    emit!(ChangeCounterPartyEvent{
        old_counter_party : old_counter_party,
        new_counter_party:counter_party
    });

    Ok(())
}

pub fn change_truth_holder(ctx: Context<UpdateAdmin>, truth_holder: Pubkey) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_mut()?;
    let old_truth_holder = admin.truth_holder;
    admin.truth_holder = truth_holder;

    emit!(ChangeTruthHolderEvent{
        old_truth_holder : old_truth_holder,
        new_truth_holder:truth_holder
    });

    Ok(())
}

pub fn change_price_feed_program(ctx: Context<UpdateAdmin>, price_feed_program: Pubkey) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_mut()?;
    let old_price_feed_program = admin.price_feed_program;
    admin.price_feed_program = price_feed_program;

    emit!(ChangePriceFeedProgramEvent{
        old_price_feed_program : old_price_feed_program,
        new_price_feed_program:price_feed_program
    });

    Ok(())
}


#[derive(Accounts)]
pub struct Initialize<'info> {
    //#[account(mut, address = crate::ID)]
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init, payer = signer, space = 8 + std::mem::size_of::< Admin > (), seeds = [constants::ADMIN.as_bytes()], bump)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(init, payer = signer, space = 8, seeds = [constants::SOL_VAULT.as_bytes()], bump)]
    pub sol_vault: Account<'info, Empty>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut, constraint = admin.load() ?.authority == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,
    pub system_program: Program<'info, System>,
}

#[derive(Default)]
#[account()]
pub struct Empty {}

#[account(zero_copy(unsafe))]
#[derive(Eq, PartialEq, Debug)]
#[repr(C)]
pub struct Admin {
    pub authority: Pubkey,
    pub sol_vault_bump: u8,
    pub global_withdraw_enabled: bool,
    pub hourly_limit: u64,
    pub init: bool,
    pub operator: Pubkey,
    pub truth_holder: Pubkey,
    pub counter_party: Pubkey,
    pub claim_per_hour_cursor: u64,
    pub claim_per_hour_value: u64,
    pub price_feed_program: Pubkey,
}

#[account(zero_copy(unsafe))]
#[derive(Eq, PartialEq, Debug)]
#[repr(C)]
pub struct Bank {
    //8+32+32+32+1+1+1+(8+8)*600+32+8+1+1+1=9750<10240
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub token_vault_authority: Pubkey,
    pub token_vault_authority_bump: u8,
    pub enabled: bool,
    pub claim_history: [ClaimHistoryItem; 600],
    pub price_feed: Pubkey,
    pub price: u64,
    pub fixed_price: bool,
    pub price_decimals: u8,
    pub token_decimals: u8,
}

#[zero_copy(unsafe)]
#[derive(Debug, Eq, PartialEq)]
#[repr(C)]
pub struct ClaimHistoryItem {
    pub idempotent: u64,
    pub dead_line: u64,
}

impl Bank {
    pub fn has_claim_history_item(&mut self, idempotent: u64) -> bool {
        return self.claim_history.iter().find(|item| item.idempotent == idempotent).is_some();
    }

    pub fn add_claim_history_item(&mut self, idempotent: u64, dead_line: u64, current_timestamp: u64) -> bool {
        for item in self.claim_history.iter_mut() {
            if item.dead_line <= (current_timestamp + 120) {
                item.dead_line = dead_line;
                item.idempotent = idempotent;
                return true;
            }
        }
        return false;
    }
}

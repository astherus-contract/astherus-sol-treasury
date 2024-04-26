use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::events::*;
use crate::constants;


pub fn initialize(ctx: Context<Initialize>, global_withdraw_enabled: bool, hourly_limit: u64,
                  operator: Pubkey, counter_party: Pubkey, truth_holder: Pubkey, price_feed_program: Pubkey, remove_claim_history: Pubkey) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_init()?;
    require!(!admin.init, ErrorCode::AlreadyInitialized);
    admin.init = true;
    admin.global_withdraw_enabled = global_withdraw_enabled;
    admin.hourly_limit = hourly_limit;
    admin.authority = ctx.accounts.signer.key();
    admin.operator = operator;
    admin.counter_party = counter_party;
    admin.truth_holder = truth_holder;
    admin.price_feed_program = price_feed_program;
    admin.remove_claim_history = remove_claim_history;
    emit!(InitializeEvent{
        init : true,
        global_withdraw_enabled : global_withdraw_enabled,
        hourly_limit : hourly_limit,
        operator : operator,
        counter_party : counter_party,
        truth_holder : truth_holder,
        price_feed_program:price_feed_program,
        remove_claim_history:remove_claim_history
    });

    msg!("InitializeEvent:init=true,globalWithdrawEnabled={},hourlyLimit={},operator={},counterParty={},truthHolder={},priceFeedProgram={},removeClaimHistory={}",
    global_withdraw_enabled,
        hourly_limit,
        operator.key().to_string(),
        counter_party.key().to_string(),
        truth_holder.key().to_string(),
        price_feed_program.key().to_string(),
        remove_claim_history.key().to_string()
    );

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

    msg!("UpdateWithdrawEnabledEvent:oldGlobalWithdrawEnabled={},newGlobalWithdrawEnabled={}",
        old_global_withdraw_enabled,
        global_withdraw_enabled
    );

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

    msg!("UpdateHourlyLimitEvent:oldHourlyLimit={},newHourlyLimit={}",
        old_hourly_limit,
        hourly_limit
    );

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

    msg!("ChangeOperatorEvent:oldOperator={},newOperator={}",
        old_operator.key().to_string(),
        operator.key().to_string(),
    );

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

    msg!("ChangeCounterPartyEvent:oldCounterParty={},newCounterParty={}",
        old_counter_party.key().to_string(),
        counter_party.key().to_string()
    );

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

    msg!("ChangeTruthHolderEvent:oldTruthHolder={},newTruthHolder={}",
        old_truth_holder.key().to_string(),
        truth_holder.key().to_string()
    );

    Ok(())
}

pub fn change_authority(ctx: Context<UpdateAdmin>, authority: Pubkey) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_mut()?;
    let old_authority = admin.authority;
    admin.authority = authority;

    emit!(ChangeAuthorityEvent{
        old_authority : old_authority,
        new_authority:authority
    });

    msg!("ChangeAuthorityEvent:oldAuthority={},newAuthority={}",
        old_authority.key().to_string(),
        authority.key().to_string()
    );

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

    msg!("ChangePriceFeedProgramEvent:oldPriceFeedProgram={},newPricePeedProgram={}",
        old_price_feed_program.key().to_string(),
        price_feed_program.key().to_string()
    );

    Ok(())
}

pub fn change_remove_claim_history(ctx: Context<UpdateAdmin>, remove_claim_history: Pubkey) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_mut()?;
    let old_remove_claim_history = admin.remove_claim_history;
    admin.remove_claim_history = remove_claim_history;

    emit!(ChangeRemoveClaimHistoryEvent{
        old_remove_claim_history : old_remove_claim_history,
        new_remove_claim_history:remove_claim_history
    });

    msg!("ChangeRemoveClaimHistoryEvent:oldRemoveClaimHistory={},newRemoveClaimHistory={}",
        old_remove_claim_history.key().to_string(),
        remove_claim_history.key().to_string()
    );

    Ok(())
}


#[derive(Accounts)]
pub struct Initialize<'info> {
    //#[account(mut, address = crate::ID)]
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init, payer = signer, space = 8 + std::mem::size_of::< Admin > (), seeds = [constants::ADMIN.as_bytes()], bump)]
    pub admin: AccountLoader<'info, Admin>,
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
    pub claim_per_hour_cursor: u32,
    pub claim_per_hour_value: u64,
    pub price_feed_program: Pubkey,
    pub remove_claim_history: Pubkey,
}

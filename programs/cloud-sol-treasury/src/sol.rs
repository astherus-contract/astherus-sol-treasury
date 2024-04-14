use anchor_lang::{prelude::*};

use chainlink_solana as chainlink;
use crate::errors::ErrorCode;

use crate::events::*;
use crate::init::*;
use crate::constants;

pub fn add_sol(ctx: Context<AddSol>, enabled: bool, sol_vault_bump: u8, price: u64, fixed_price: bool, price_decimals: u8, token_decimals: u8) -> Result<()> {
    let sol_vault = &mut ctx.accounts.sol_vault.load_init()?;
    let admin = &mut ctx.accounts.admin.load_mut()?;

    sol_vault.enabled = enabled;
    sol_vault.price = price;
    sol_vault.fixed_price = fixed_price;
    sol_vault.price_decimals = price_decimals;
    sol_vault.token_decimals = token_decimals;
    sol_vault.price_feed = *ctx.accounts.price_feed.key;

    admin.sol_vault_bump = sol_vault_bump;

    if !fixed_price {
        let decimals = chainlink::decimals(
            ctx.accounts.price_feed_program.to_account_info(),
            ctx.accounts.price_feed.to_account_info(),
        ).unwrap();
        require!(decimals == price_decimals, ErrorCode::InvalidPriceDecimals);
    }

    emit!(AddSolEvent{
        sol_vault: ctx.accounts.sol_vault.key(),
        admin: ctx.accounts.admin.key(),
    });

    Ok(())
}

pub fn update_sol_enabled(ctx: Context<UpdateSolEnabled>, enabled: bool) -> Result<()> {
    let sol_vault = &mut ctx.accounts.sol_vault.load_mut()?;
    let old_enabled = sol_vault.enabled;
    sol_vault.enabled = enabled;

    emit!(UpdateSolEnabledEvent{
        old_enabled : old_enabled,
        new_enabled : enabled,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct AddSol<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut, constraint = admin.load() ?.authority == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(init, payer = signer, space = 8 + std::mem::size_of::< SolVault > (), seeds = [constants::SOL_VAULT.as_bytes(),admin.key().as_ref()], bump)]
    pub sol_vault: AccountLoader<'info, SolVault>,
    /// CHECK: We're reading data from this chainlink feed account
    pub price_feed: UncheckedAccount<'info>,
    /// CHECK: This is the Chainlink program library
    pub price_feed_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct UpdateSolEnabled<'info> {
    #[account()]
    pub signer: Signer<'info>,
    #[account(constraint = admin.load() ?.authority == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,

    #[account(seeds = [constants::SOL_VAULT.as_bytes(),admin.key().as_ref()], bump = admin.load() ?.sol_vault_bump)]
    pub sol_vault: AccountLoader<'info, SolVault>,
    pub system_program: Program<'info, System>,
}

#[account(zero_copy(unsafe))]
#[derive(Eq, PartialEq, Debug)]
#[repr(C)]
pub struct SolVault {
    //8+1+(8+8)*600+32+8+1+1+1=9652<10240
    pub enabled: bool,
    pub claim_history: [ClaimHistoryItem; 600],
    pub price_feed: Pubkey,
    pub price: u64,
    pub fixed_price: bool,
    pub price_decimals: u8,
    pub token_decimals: u8,
}

impl SolVault {
    pub fn has_claim_history_item(&mut self, idempotent: u64) -> bool {
        return self.claim_history.iter().find(|item| item.idempotent == idempotent).is_some();
    }

    pub fn add_claim_history_item(&mut self, idempotent: u64, dead_line: u64, current_timestamp: u64) -> bool {
        for item in self.claim_history.iter_mut() {
            if item.dead_line <= (current_timestamp - 120) {
                item.dead_line = dead_line;
                item.idempotent = idempotent;
                return true;
            }
        }
        return false;
    }
}


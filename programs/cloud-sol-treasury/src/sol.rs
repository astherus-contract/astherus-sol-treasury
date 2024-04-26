use anchor_lang::prelude::*;

use chainlink_solana as chainlink;
use crate::errors::ErrorCode;

use crate::events::*;
use crate::init::*;
use crate::constants;
use crate::constants::CLAIM_HISTORY_SIZE;

pub fn add_sol(ctx: Context<AddSol>, enabled: bool, sol_vault_bump: u8, price: u64, fixed_price: bool, price_decimals: u8, token_decimals: u8) -> Result<()> {
    let sol_vault = &mut ctx.accounts.sol_vault.load_init()?;
    let admin = &mut ctx.accounts.admin.load_mut()?;

    sol_vault.enabled = enabled;
    sol_vault.price = price;
    sol_vault.fixed_price = fixed_price;
    sol_vault.price_decimals = price_decimals;
    sol_vault.token_decimals = token_decimals;
    sol_vault.price_feed = ctx.accounts.price_feed.key();
    sol_vault.admin = ctx.accounts.admin.key();
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

    msg!("AddSolEvent:solVault={},admin={}",
            ctx.accounts.sol_vault.key().to_string(),
            ctx.accounts.admin.key().to_string(),
    );

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

    msg!("UpdateSolEnabledEvent:oldEnabled={},newEnabled={}",
        old_enabled,
        enabled,
    );

    Ok(())
}

pub fn remove_sol_claim_history(ctx: Context<RemoveSolClaimHistory>, idempotent_str: String) -> Result<()> {
    let sol_vault = &mut ctx.accounts.sol_vault.load_mut()?;
    let current_timestamp = Clock::get()?.unix_timestamp as u32;
    let idempotent_vec = idempotent_str.split(",").map(|x| x.parse().unwrap()).collect();
    sol_vault.remove_claim_history_item(idempotent_vec, current_timestamp);
    Ok(())
}

#[derive(Accounts)]
pub struct AddSol<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut, constraint = admin.load() ?.authority == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(init, payer = signer, space = 8 + std::mem::size_of::< SolVault > (), seeds = [constants::SOL_VAULT.as_bytes(), admin.key().as_ref()], bump)]
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

    #[account(mut, has_one = admin, seeds = [constants::SOL_VAULT.as_bytes(), admin.key().as_ref()], bump = admin.load() ?.sol_vault_bump)]
    pub sol_vault: AccountLoader<'info, SolVault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveSolClaimHistory<'info> {
    #[account()]
    pub signer: Signer<'info>,
    #[account(constraint = admin.load() ?.remove_claim_history == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(mut, has_one = admin, seeds = [constants::SOL_VAULT.as_bytes(), admin.key().as_ref()], bump = admin.load() ?.sol_vault_bump)]
    pub sol_vault: AccountLoader<'info, SolVault>,
    pub system_program: Program<'info, System>,
}

#[account(zero_copy(unsafe))]
#[derive(Eq, PartialEq, Debug)]
#[repr(C)]
pub struct SolVault {
    //8+8*800+4*800+1+32+32+8+1+1+1=9684<10240
    pub idempotent: [u64; CLAIM_HISTORY_SIZE],
    pub dead_line: [u32; CLAIM_HISTORY_SIZE],
    pub enabled: bool,
    pub price_feed: Pubkey,
    pub admin: Pubkey,
    pub price: u64,
    pub fixed_price: bool,
    pub price_decimals: u8,
    pub token_decimals: u8,
}


impl SolVault {
    pub fn has_claim_history_item(&mut self, idempotent: u64) -> bool {
        return self.idempotent.iter().find(|item| **item == idempotent).is_some();
    }

    pub fn add_claim_history_item(&mut self, idempotent: u64, dead_line: u32) -> bool {
        for n in 0..CLAIM_HISTORY_SIZE {
            if self.idempotent[n] == 0 && self.dead_line[n] == 0 {
                self.idempotent[n] = idempotent;
                self.dead_line[n] = dead_line;
                return true;
            }
        }
        return false;
    }

    pub fn remove_claim_history_item(&mut self, idempotent_vec: Vec<u64>, current_timestamp: u32) {
        for idempotent in idempotent_vec.iter() {
            for n in 0..CLAIM_HISTORY_SIZE {
                if self.idempotent[n] == *idempotent && self.dead_line[n] <= (current_timestamp - 120) {
                    msg!("RemoveClaimHistoryEvent:idempotent={},deadLine={}",self.idempotent[n],self.dead_line[n]);
                    self.idempotent[n] = 0;
                    self.dead_line[n] = 0;
                }
            }
        }
    }
}


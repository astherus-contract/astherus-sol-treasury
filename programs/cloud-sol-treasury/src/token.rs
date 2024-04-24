use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
        Mint, Token, TokenAccount,
    },
};
use chainlink_solana as chainlink;
use crate::errors::ErrorCode;

use crate::events::*;
use crate::init::*;
use crate::constants;

pub fn add_token(ctx: Context<AddToken>, enabled: bool, token_vault_authority_bump: u8,price: u64, fixed_price: bool, price_decimals: u8, token_decimals: u8) -> Result<()> {
    let bank = &mut ctx.accounts.bank.load_init()?;
    bank.admin = ctx.accounts.admin.key();
    bank.token_mint = ctx.accounts.token_mint.key();
    bank.token_vault_authority = ctx.accounts.token_vault_authority.key();
    bank.token_vault_authority_bump = token_vault_authority_bump;
    bank.enabled = enabled;
    bank.price = price;
    bank.fixed_price = fixed_price;
    bank.price_decimals = price_decimals;
    bank.token_decimals = token_decimals;
    bank.price_feed = ctx.accounts.price_feed.key();

    if !fixed_price {
        let decimals = chainlink::decimals(
            ctx.accounts.price_feed_program.to_account_info(),
            ctx.accounts.price_feed.to_account_info(),
        ).unwrap();
        require!(decimals == price_decimals, ErrorCode::InvalidPriceDecimals);
    }

    emit!(AddTokenEvent{
        token_mint: bank.token_mint,
        bank: ctx.accounts.bank.key(),
    });

    msg!("AddTokenEvent:tokenMint={},bank={}",
            bank.token_mint.to_string(),
            ctx.accounts.bank.key().to_string()
        );

    Ok(())
}

pub fn update_token_enabled(ctx: Context<UpdateTokenEnabled>, enabled: bool) -> Result<()> {
    let bank = &mut ctx.accounts.bank.load_mut()?;
    let old_enabled = bank.enabled;
    bank.enabled = enabled;

    emit!(UpdateTokenEnabledEvent{
        token_mint: bank.token_mint,
        bank: ctx.accounts.bank.key(),
        old_enabled : old_enabled,
        new_enabled : enabled,
    });

    msg!("UpdateTokenEnabledEvent:tokenMint={},bank={},oldEnabled={},newEnabled={}",
            bank.token_mint.to_string(),
            ctx.accounts.bank.key().to_string(),
            old_enabled,
            enabled
    );

    Ok(())
}

#[derive(Accounts)]
pub struct AddToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(constraint = admin.load() ?.authority == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(init, payer = signer, space = 8 + std::mem::size_of::< Bank > ())]
    pub bank: AccountLoader<'info, Bank>,
    /// CHECK:
    #[account(seeds = [constants::TOKEN_VAULT_AUTHORITY.as_bytes(), bank.key().as_ref()], bump)]
    pub token_vault_authority: UncheckedAccount<'info>,
    #[account(init, payer = signer, associated_token::mint = token_mint, associated_token::authority = token_vault_authority,)]
    pub token_vault: Account<'info, TokenAccount>,
    /// CHECK: We're reading data from this chainlink feed account
    pub price_feed: UncheckedAccount<'info>,
    /// CHECK: This is the Chainlink program library
    pub price_feed_program: UncheckedAccount<'info>,
    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct UpdateTokenEnabled<'info> {
    #[account()]
    pub signer: Signer<'info>,
    #[account(constraint = admin.load() ?.authority == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(mut,has_one = token_vault_authority, has_one = admin)]
    pub bank: AccountLoader<'info, Bank>,

    /// CHECK
    #[account(seeds = [constants::TOKEN_VAULT_AUTHORITY.as_bytes(), bank.key().as_ref()], bump = bank.load() ?.token_vault_authority_bump)]
    pub token_vault_authority: UncheckedAccount<'info>,

    #[account(associated_token::mint = token_mint, associated_token::authority = token_vault_authority,)]
    pub token_vault: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account(zero_copy(unsafe))]
#[derive(Eq, PartialEq, Debug)]
#[repr(C)]
pub struct Bank {
    //8+32+32+32+1+1+(4+4)*1200+32+8+1+1+1=9749<10240
    pub admin: Pubkey,
    pub token_mint: Pubkey,
    pub token_vault_authority: Pubkey,
    pub token_vault_authority_bump: u8,
    pub enabled: bool,
    pub claim_history: [ClaimHistoryItem; 1200],
    pub price_feed: Pubkey,
    pub price: u64,
    pub fixed_price: bool,
    pub price_decimals: u8,
    pub token_decimals: u8,
}

impl Bank {
    pub fn has_claim_history_item(&mut self, idempotent: u32) -> bool {
        return self.claim_history.iter().find(|item| item.idempotent == idempotent).is_some();
    }

    pub fn add_claim_history_item(&mut self, idempotent: u32, dead_line: u32, current_timestamp: u32) -> bool {
        for item in self.claim_history.iter_mut() {
            if item.dead_line <= (current_timestamp - 120) {

                msg!("RemoveClaimHistoryEvent:idempotent={},deadLine={}",item.idempotent,item.dead_line);

                item.dead_line = dead_line;
                item.idempotent = idempotent;
                return true;
            }
        }
        return false;
    }
}

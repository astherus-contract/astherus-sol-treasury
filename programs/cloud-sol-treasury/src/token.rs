use anchor_lang::{prelude::*};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
        Mint, Token, TokenAccount,
    },
};

use crate::events::*;
use crate::init::*;
use crate::constants;

pub fn add_token(ctx: Context<AddToken>, enabled: bool, token_vault_authority_bump: u8, sol_vault_bump: u8,price: u64, fixed_price: bool, price_decimals: u8, token_decimals: u8) -> Result<()> {
    let bank = &mut ctx.accounts.bank.load_init()?;
    bank.authority = *ctx.accounts.signer.key;
    bank.token_mint = *ctx.accounts.token_mint.to_account_info().key;
    bank.token_vault_authority = *ctx.accounts.token_vault_authority.key;
    bank.token_vault_authority_bump = token_vault_authority_bump;
    bank.sol_vault_bump = sol_vault_bump;
    bank.enabled = enabled;
    bank.price = price;
    bank.fixed_price = fixed_price;
    bank.price_decimals = price_decimals;
    bank.token_decimals = token_decimals;
    bank.price_feed = *ctx.accounts.price_feed.key;

    emit!(AddTokenEvent{
        token_mint: bank.token_mint,
        bank: ctx.accounts.bank.key(),
    });

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

    Ok(())
}

#[derive(Accounts)]
pub struct AddToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init, payer = signer, space = 8 + std::mem::size_of::< Bank > ())]
    pub bank: AccountLoader<'info, Bank>,
    #[account(init, payer = signer, space = 8, seeds = [constants::SOL_VAULT.as_bytes(), bank.key().as_ref()], bump)]
    pub sol_vault: Account<'info, Empty>,
    /// CHECK:
    #[account(seeds = [constants::TOKEN_VAULT_AUTHORITY.as_bytes(), bank.key().as_ref()], bump)]
    pub token_vault_authority: UncheckedAccount<'info>,
    #[account(init_if_needed, payer = signer, associated_token::mint = token_mint, associated_token::authority = token_vault_authority,)]
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
    #[account(has_one = token_vault_authority, constraint = bank.load() ?.authority == * signer.key)]
    pub bank: AccountLoader<'info, Bank>,

    /// CHECK
    #[account(seeds = [constants::TOKEN_VAULT_AUTHORITY.as_bytes(), bank.key().as_ref()], bump = bank.load() ?.token_vault_authority_bump)]
    pub token_vault_authority: UncheckedAccount<'info>,

    #[account(mut, associated_token::mint = token_mint, associated_token::authority = token_vault_authority,)]
    pub token_vault: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

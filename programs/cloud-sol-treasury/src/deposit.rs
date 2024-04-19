use anchor_lang::{prelude::*, system_program};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
        Mint, Token, TokenAccount, Transfer as SplTransfer,
    },
};

use crate::init::Admin;
use crate::token::Bank;
use crate::errors::ErrorCode;
use crate::events::*;
use crate::constants;
use crate::sol::SolVault;


pub fn deposit_sol(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
    let signer = &ctx.accounts.signer;
    let sys_program = &ctx.accounts.system_program;

    {
        let sol_vault = &ctx.accounts.sol_vault.load()?;

        if !sol_vault.enabled {
            return Err(ErrorCode::DepositAndWithdrawalDisabled.into());
        }
    }

    require!(amount > 0, ErrorCode::ZeroAmount);
    require!(signer.lamports() >= amount, ErrorCode::InsufficientUserBalance);


    let cpi_accounts = system_program::Transfer {
        from: signer.to_account_info(),
        to: ctx.accounts.sol_vault.to_account_info(),
    };

    let cpi = CpiContext::new(sys_program.to_account_info(), cpi_accounts);

    system_program::transfer(cpi, amount)?;

    emit!(DepositSolEvent{
     from: ctx.accounts.signer.key(),
     to:ctx.accounts.sol_vault.key(),
     signer: ctx.accounts.signer.key(),
     amount: amount,
    });

    msg!("DepositSolEvent:from={},to={},signer={},amount={}",
        ctx.accounts.signer.key().to_string(),
        ctx.accounts.sol_vault.key().to_string(),
        ctx.accounts.signer.key().to_string(),
        amount);

    Ok(())
}

pub fn deposit_token(ctx: Context<DepositToken>, amount: u64) -> Result<()> {
    let bank = &ctx.accounts.bank.load()?;
    if !bank.enabled {
        return Err(ErrorCode::DepositAndWithdrawalDisabled.into());
    }

    require!(amount > 0, ErrorCode::ZeroAmount);
    require!(ctx.accounts.depositor.amount >= amount, ErrorCode::InsufficientUserBalance);

    let cpi_accounts = SplTransfer {
        from: ctx.accounts.depositor.to_account_info(),
        to: ctx.accounts.token_vault.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };

    let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);

    anchor_spl::token::transfer(cpi, amount)?;

    emit!(DepositTokenEvent{
        token_mint: bank.token_mint,
        bank: ctx.accounts.bank.key(),
        from: ctx.accounts.depositor.key(),
        to:ctx.accounts.token_vault.key(),
        signer: ctx.accounts.signer.key(),
        amount: amount,
    });

    msg!("DepositTokenEvent:token_mint={},bank={},from={},to={},signer={},amount={}",
        bank.token_mint.to_string(),
        ctx.accounts.bank.key().to_string(),
        ctx.accounts.depositor.key().to_string(),
        ctx.accounts.token_vault.key().to_string(),
        ctx.accounts.signer.key().to_string(),
        amount);

    Ok(())
}

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account()]
    pub admin: AccountLoader<'info, Admin>,
    #[account(mut, has_one = admin, seeds = [constants::SOL_VAULT.as_bytes(), admin.key().as_ref()], bump = admin.load() ?.sol_vault_bump)]
    pub sol_vault: AccountLoader<'info, SolVault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositToken<'info> {
    #[account()]
    pub signer: Signer<'info>,
    #[account()]
    pub admin: AccountLoader<'info, Admin>,

    #[account(has_one = token_vault_authority, has_one = admin)]
    pub bank: AccountLoader<'info, Bank>,

    /// CHECK
    #[account(seeds = [constants::TOKEN_VAULT_AUTHORITY.as_bytes(), bank.key().as_ref()], bump = bank.load() ?.token_vault_authority_bump)]
    pub token_vault_authority: UncheckedAccount<'info>,

    #[account(mut, associated_token::mint = token_mint, associated_token::authority = token_vault_authority,)]
    pub token_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub depositor: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}



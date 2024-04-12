use std::ops::{Div, Mul};
use anchor_lang::{prelude::*};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
        Mint, Token, TokenAccount, Transfer as SplTransfer,
    },
};
use solana_program::sysvar::instructions::{ID as IX_ID, load_instruction_at_checked};
use solana_program::instruction::Instruction;

use anchor_lang::solana_program::keccak::hashv as keccak;

use num_bigint::{BigUint};

use crate::init::{Bank, Admin, Empty};
use crate::errors::ErrorCode;
use crate::events::*;
use crate::utils;
use crate::constants;
use chainlink_solana as chainlink;


pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount: u64, dead_line: u64, idempotent: u64) -> Result<()> {
    let admin = &ctx.accounts.admin.load()?;
    let sol_vault = &mut ctx.accounts.sol_vault;
    let current_timestamp = Clock::get()?.unix_timestamp as u64;
    require!(current_timestamp < dead_line, ErrorCode::AlreadyPassedDeadline);


    if !admin.global_withdraw_enabled {
        return Err(ErrorCode::DepositAndWithdrawalDisabled.into());
    }

    require!(amount > 0, ErrorCode::ZeroAmount);

    let rent = Rent::get()?.minimum_balance(sol_vault.to_account_info().data_len());
    let lamports = sol_vault.to_account_info().lamports();

    if lamports - rent < amount {
        return Err(ErrorCode::InsufficientVaultBalance.into());
    };

    // sol_vault 是系统账户
    // let cpi_accounts = system_program::Transfer {
    //     from: sol_vault.to_account_info(),
    //     to: ctx.accounts.receiver.to_account_info(),
    // };
    //
    // let seeds = &[
    //     b"sol_vault",
    //     bank.to_account_info().key.as_ref(),
    //     &[bank.sol_vault_bump],
    // ];
    //
    //
    // let signer = &[&seeds[..]];
    // let cpi = CpiContext::new_with_signer(sys_program.to_account_info(), cpi_accounts, signer);
    //
    // system_program::transfer(cpi, amount)?;


    //sol_vault 是程序账户
    ctx.accounts.sol_vault.sub_lamports(amount)?;
    ctx.accounts.receiver.add_lamports(amount)?;

    emit!(WithdrawSolEvent{
     from: *ctx.accounts.sol_vault.to_account_info().key,
     to:*ctx.accounts.receiver.to_account_info().key,
     signer: *ctx.accounts.signer.key,
     amount: amount,
    });

    Ok(())
}

pub fn withdraw_sol_to_counter_party(ctx: Context<WithdrawSolToCounterParty>, amount: u64) -> Result<()> {
    let sol_vault = &mut ctx.accounts.sol_vault;

    require!(amount > 0, ErrorCode::ZeroAmount);

    let rent = Rent::get()?.minimum_balance(sol_vault.to_account_info().data_len());
    let lamports = sol_vault.to_account_info().lamports();

    if lamports - rent < amount {
        return Err(ErrorCode::InsufficientVaultBalance.into());
    };

    ctx.accounts.sol_vault.sub_lamports(amount)?;
    ctx.accounts.receiver.add_lamports(amount)?;

    emit!(WithdrawSolToCounterPartyEvent{
     from: *ctx.accounts.sol_vault.to_account_info().key,
     to:*ctx.accounts.receiver.to_account_info().key,
     signer: *ctx.accounts.signer.key,
     amount: amount,
    });

    Ok(())
}

pub fn withdraw_spl(ctx: Context<WithdrawSpl>, amount: u64, dead_line: u64, idempotent: u64) -> Result<()> {
    let admin = &ctx.accounts.admin.load()?;
    let bank = &mut ctx.accounts.bank.load_mut()?;
    if !bank.enabled || !admin.global_withdraw_enabled {
        return Err(ErrorCode::DepositAndWithdrawalDisabled.into());
    }

    let current_timestamp = Clock::get()?.unix_timestamp as u64;
    require!(dead_line > current_timestamp, ErrorCode::AlreadyPassedDeadline);
    require!(amount > 0, ErrorCode::ZeroAmount);
    require!(ctx.accounts.token_vault.amount >= amount, ErrorCode::InsufficientVaultBalance);
    if bank.has_claim_history_item(idempotent) {
        return Err(ErrorCode::AlreadyClaimed.into());
    }

    if !bank.add_claim_history_item(idempotent, dead_line, current_timestamp) {
        return Err(ErrorCode::WithdrawalExceedsMaximumProcessingLimit.into());
    }

    //require!(!bank.claim_history.contains_key(idempotent), ErrorCode::AlreadyClaimed);

    // let cursor = current_timestamp / 60 * 60 * 1000;
    // let per_hour = admin.claim_per_hours.get(cursor).unwrap_or(0);
    // if (per_hour + amount) > admin.hourly_limit {
    //     //todo disable withdraw
    //     //todo emit
    //     return Err(ErrorCode::WithdrawalExceedsLimit.into());
    // }

    let cpi_accounts = SplTransfer {
        from: ctx.accounts.token_vault.to_account_info(),
        to: ctx.accounts.receiver.to_account_info(),
        authority: ctx.accounts.token_vault_authority.to_account_info(),
    };
    let binding = ctx.accounts.bank.key();

    let seeds = &[
        constants::TOKEN_VAULT_AUTHORITY.as_bytes(),
        binding.as_ref(),
        &[bank.token_vault_authority_bump],
    ];

    let signer = &[&seeds[..]];

    let cpi = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer,
    );

    anchor_spl::token::transfer(cpi, amount)?;

    // admin.claim_per_hours.insert(cursor, per_hour + amount);

    emit!(WithdrawSplEvent{
     token_mint: bank.token_mint,
     bank: ctx.accounts.bank.key(),
     from: *ctx.accounts.token_vault.to_account_info().key,
     to:*ctx.accounts.receiver.to_account_info().key,
     signer: *ctx.accounts.signer.key,
     amount: amount,
     idempotent:idempotent,
    });

    Ok(())
}

pub fn withdraw_spl_by_signature(ctx: Context<WithdrawSplBySignature>, amount: u64, dead_line: u64, idempotent: u64, signature: [u8; 64]) -> Result<()> {
    let admin = &mut ctx.accounts.admin.load_mut()?;
    let bank = &mut ctx.accounts.bank.load_mut()?;

    let msg_hash = keccak(&[
        idempotent.to_string().as_bytes(),
        dead_line.to_string().as_bytes(),
        amount.to_string().as_bytes(),
        &ctx.accounts.admin.key().as_ref(),
        &ctx.accounts.bank.key().as_ref(),
        &ctx.accounts.token_vault_authority.to_account_info().key().as_ref(),
        &ctx.accounts.token_vault.to_account_info().key().as_ref(),
        &ctx.accounts.receiver.to_account_info().key().as_ref(),
        &ctx.accounts.price_feed.key().as_ref(),
        &ctx.accounts.price_feed_program.key().as_ref(),
        &ctx.accounts.token_mint.to_account_info().key().as_ref(),
    ]).to_bytes();

    let ix: Instruction = load_instruction_at_checked(0, &ctx.accounts.ix_sysvar)?;

    // Check that ix is what we expect to have been sent
    utils::verify_ed25519_ix(&ix, admin.truth_holder.as_ref(), &msg_hash, &signature)?;

    if !bank.enabled || !admin.global_withdraw_enabled {
        return Err(ErrorCode::DepositAndWithdrawalDisabled.into());
    }

    let current_timestamp = Clock::get()?.unix_timestamp as u64;

    require!(dead_line > current_timestamp, ErrorCode::AlreadyPassedDeadline);
    require!(amount > 0, ErrorCode::ZeroAmount);
    require!(ctx.accounts.token_vault.amount >= amount, ErrorCode::InsufficientVaultBalance);
    if bank.has_claim_history_item(idempotent) {
        return Err(ErrorCode::AlreadyClaimed.into());
    }

    if !bank.add_claim_history_item(idempotent, dead_line, current_timestamp) {
        return Err(ErrorCode::WithdrawalExceedsMaximumProcessingLimit.into());
    }

    let amount_usd = token_amount_to_usd(bank, amount, ctx.accounts.price_feed.to_account_info(), ctx.accounts.price_feed_program.to_account_info());
    let cursor = current_timestamp / (60 * 60);
    let per_hour_value;
    if admin.claim_per_hour_cursor == cursor {
        per_hour_value = admin.claim_per_hour_value + amount_usd;
    } else {
        per_hour_value = amount_usd;
    }
    if per_hour_value > admin.hourly_limit {
        admin.global_withdraw_enabled = false;
        emit!(ClaimPausedEvent{
            token_mint: bank.token_mint,
            bank: ctx.accounts.bank.key(),
            sender: *ctx.accounts.signer.key,
            to:*ctx.accounts.receiver.to_account_info().key,
            signer: *ctx.accounts.signer.key,
            amount: amount,
        });
        //todo 不应该抛出异常
        //return Err(ErrorCode::WithdrawalExceedsLimit.into());
        return Ok(());
    }

    let cpi_accounts = SplTransfer {
        from: ctx.accounts.token_vault.to_account_info(),
        to: ctx.accounts.receiver.to_account_info(),
        authority: ctx.accounts.token_vault_authority.to_account_info(),
    };
    let binding = ctx.accounts.bank.key();

    let seeds = &[
        constants::TOKEN_VAULT_AUTHORITY.as_bytes(),
        binding.as_ref(),
        &[bank.token_vault_authority_bump],
    ];

    let signer = &[&seeds[..]];

    let cpi = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer,
    );

    anchor_spl::token::transfer(cpi, amount)?;

    admin.claim_per_hour_cursor = cursor;
    admin.claim_per_hour_value = per_hour_value;

    emit!(WithdrawSplEvent{
     token_mint: bank.token_mint,
     bank: ctx.accounts.bank.key(),
     from: *ctx.accounts.token_vault.to_account_info().key,
     to:*ctx.accounts.receiver.to_account_info().key,
     signer: *ctx.accounts.signer.key,
     amount: amount,
     idempotent:idempotent,
    });

    Ok(())
}

pub fn withdraw_spl_to_counter_party(ctx: Context<WithdrawSplToCounterParty>, amount: u64) -> Result<()> {
    let bank = &ctx.accounts.bank.load()?;

    require!(amount > 0, ErrorCode::ZeroAmount);
    require!(ctx.accounts.token_vault.amount >= amount, ErrorCode::InsufficientVaultBalance);

    let cpi_accounts = SplTransfer {
        from: ctx.accounts.token_vault.to_account_info(),
        to: ctx.accounts.receiver.to_account_info(),
        authority: ctx.accounts.token_vault_authority.to_account_info(),
    };

    let binding = ctx.accounts.bank.key();

    let seeds = &[
        constants::TOKEN_VAULT_AUTHORITY.as_bytes(),
        binding.as_ref(),
        &[bank.token_vault_authority_bump],
    ];

    let signer = &[&seeds[..]];

    let cpi = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer,
    );

    anchor_spl::token::transfer(cpi, amount)?;

    emit!(TransferSplToCounterPartyEvent{
     token_mint: bank.token_mint,
     bank: ctx.accounts.bank.key(),
     from: *ctx.accounts.token_vault.to_account_info().key,
     to:*ctx.accounts.receiver.to_account_info().key,
     signer: *ctx.accounts.signer.key,
     amount: amount,
    });

    Ok(())
}

fn token_amount_to_usd<'a>(bank: &Bank, amount: u64, price_feed: AccountInfo<'a>, price_feed_program: AccountInfo<'a>) -> u64 {
    let mut price: u128 = bank.price as u128;
    if !bank.fixed_price {
        let round = chainlink::latest_round_data(
            price_feed_program,
            price_feed,
        ).unwrap();
        price = round.answer as u128;
    }
    let amount_usd: u64 = (BigUint::from(price)
        .mul(BigUint::from(amount))
        .mul(10_u64.pow(constants::USD_DECIMALS as u32))
        .div(10_u64.pow(bank.price_decimals as u32))
        .div(10_u64.pow(bank.token_decimals as u32))
    ).to_string().parse().unwrap();
    return amount_usd;
}

// fn solAmountToUsd(admin: Admin, amount: u64) -> u64 {
//     let price = bank.price;
//     if !bank.fixed_price {
//         //todo
//     }
//     return price * amount * (10 * *constants::USD_DECIMALS) / (10 * *(bank.price_decimals + bank.token_decimals));
// }

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account()]
    pub signer: Signer<'info>,
    #[account(mut, constraint = admin.load() ?.authority == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(mut, seeds = [constants::SOL_VAULT.as_bytes()], bump = admin.load() ?.sol_vault_bump)]
    pub sol_vault: Account<'info, Empty>,
    /// CHECK:
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSolToCounterParty<'info> {
    #[account()]
    pub signer: Signer<'info>,
    #[account(mut, constraint = admin.load() ?.operator == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(mut, seeds = [constants::SOL_VAULT.as_bytes()], bump = admin.load() ?.sol_vault_bump)]
    pub sol_vault: Account<'info, Empty>,
    /// CHECK:
    #[account(mut, constraint = admin.load() ?.counter_party == * receiver.key)]
    pub receiver: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSpl<'info> {
    #[account()]
    pub signer: Signer<'info>,
    #[account(mut, constraint = admin.load() ?.authority == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(mut, has_one = token_vault_authority, constraint = bank.load() ?.authority == * signer.key)]
    pub bank: AccountLoader<'info, Bank>,

    /// CHECK
    #[account(seeds = [constants::TOKEN_VAULT_AUTHORITY.as_bytes(), bank.key().as_ref()], bump = bank.load() ?.token_vault_authority_bump)]
    pub token_vault_authority: UncheckedAccount<'info>,

    #[account(mut, associated_token::mint = token_mint, associated_token::authority = token_vault_authority,)]
    pub token_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub receiver: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSplToCounterParty<'info> {
    #[account()]
    pub signer: Signer<'info>,
    #[account(mut, constraint = admin.load() ?.operator == * signer.key)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(has_one = token_vault_authority)]
    pub bank: AccountLoader<'info, Bank>,

    /// CHECK
    #[account(seeds = [constants::TOKEN_VAULT_AUTHORITY.as_bytes(), bank.key().as_ref()], bump = bank.load() ?.token_vault_authority_bump)]
    pub token_vault_authority: UncheckedAccount<'info>,

    #[account(mut, associated_token::mint = token_mint, associated_token::authority = token_vault_authority,)]
    pub token_vault: Account<'info, TokenAccount>,
    #[account(mut, constraint = admin.load() ?.counter_party == receiver.owner.key())]
    pub receiver: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSplBySignature<'info> {
    #[account()]
    pub signer: Signer<'info>,
    #[account(mut, has_one = price_feed_program)]
    pub admin: AccountLoader<'info, Admin>,
    #[account(mut, has_one = token_vault_authority, has_one = price_feed)]
    pub bank: AccountLoader<'info, Bank>,

    /// CHECK
    #[account(seeds = [constants::TOKEN_VAULT_AUTHORITY.as_bytes(), bank.key().as_ref()], bump = bank.load() ?.token_vault_authority_bump)]
    pub token_vault_authority: UncheckedAccount<'info>,

    #[account(mut, associated_token::mint = token_mint, associated_token::authority = token_vault_authority,)]
    pub token_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub receiver: Account<'info, TokenAccount>,

    /// CHECK: We're reading data from this chainlink feed account
    pub price_feed: UncheckedAccount<'info>,
    /// CHECK: This is the Chainlink program library
    pub price_feed_program: UncheckedAccount<'info>,
    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    /// CHECK:
    #[account(address = IX_ID)]
    pub ix_sysvar: AccountInfo<'info>,
}








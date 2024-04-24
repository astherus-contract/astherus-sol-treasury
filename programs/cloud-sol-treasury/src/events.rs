use anchor_lang::prelude::*;

#[event]
pub struct InitializeEvent {
    pub global_withdraw_enabled: bool,
    pub hourly_limit: u64,
    pub init: bool,
    pub operator: Pubkey,
    pub counter_party: Pubkey,
    pub truth_holder: Pubkey,
    pub price_feed_program: Pubkey,
}

#[event]
pub struct UpdateWithdrawEnabledEvent {
    pub old_global_withdraw_enabled: bool,
    pub new_global_withdraw_enabled: bool,
}

#[event]
pub struct ChangeOperatorEvent {
    pub old_operator: Pubkey,
    pub new_operator: Pubkey,
}

#[event]
pub struct ChangeCounterPartyEvent {
    pub old_counter_party: Pubkey,
    pub new_counter_party: Pubkey,
}

#[event]
pub struct ChangeTruthHolderEvent {
    pub old_truth_holder: Pubkey,
    pub new_truth_holder: Pubkey,
}


#[event]
pub struct ChangeAuthorityEvent {
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
}


#[event]
pub struct ChangePriceFeedProgramEvent {
    pub old_price_feed_program: Pubkey,
    pub new_price_feed_program: Pubkey,
}

#[event]
pub struct UpdateHourlyLimitEvent {
    pub old_hourly_limit: u64,
    pub new_hourly_limit: u64,
}

#[event]
pub struct AddTokenEvent {
    pub token_mint: Pubkey,
    pub bank: Pubkey,
}


#[event]
pub struct UpdateTokenEnabledEvent {
    pub token_mint: Pubkey,
    pub bank: Pubkey,
    pub old_enabled: bool,
    pub new_enabled: bool,
}

#[event]
pub struct AddSolEvent {
    pub sol_vault: Pubkey,
    pub admin: Pubkey,
}


#[event]
pub struct UpdateSolEnabledEvent {
    pub old_enabled: bool,
    pub new_enabled: bool,
}

#[event]
pub struct DepositSolEvent {
    pub from: Pubkey,
    pub to: Pubkey,
    pub signer: Pubkey,
    pub amount: u64,
}

#[event]
pub struct DepositTokenEvent {
    pub token_mint: Pubkey,
    pub bank: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
    pub signer: Pubkey,
    pub amount: u64,
}

#[event]
pub struct WithdrawSolEvent {
    pub from: Pubkey,
    pub to: Pubkey,
    pub signer: Pubkey,
    pub amount: u64,
    pub idempotent: u32,
    pub dead_line: u32,
}

#[event]
pub struct WithdrawSolToCounterPartyEvent {
    pub from: Pubkey,
    pub to: Pubkey,
    pub signer: Pubkey,
    pub amount: u64,
}

#[event]
pub struct WithdrawTokenEvent {
    pub token_mint: Pubkey,
    pub bank: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
    pub signer: Pubkey,
    pub amount: u64,
    pub idempotent: u32,
}

#[event]
pub struct TransferTokenToCounterPartyEvent {
    pub token_mint: Pubkey,
    pub bank: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
    pub signer: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ClaimPausedEvent {
    pub idempotent: u32,
    pub to: Pubkey,
    pub signer: Pubkey,
    pub amount: u64,
    pub dead_line: u32,
}

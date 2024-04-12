use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Deposit and withdrawal function has been closed.")]
    DepositAndWithdrawalDisabled,
    #[msg("amount must be greater than 0")]
    ZeroAmount,
    #[msg("vault balance is lower than withdraw amount requested")]
    InsufficientVaultBalance,
    #[msg("User does not have enough balance to deposit")]
    InsufficientUserBalance,
    #[msg("already passed deadline")]
    AlreadyPassedDeadline,
    #[msg("already claimed")]
    AlreadyClaimed,
    #[msg("Withdrawal exceeds limit")]
    WithdrawalExceedsLimit,
    #[msg("Already initialized")]
    AlreadyInitialized,
    #[msg("Withdrawal exceeds maximum processing limit")]
    WithdrawalExceedsMaximumProcessingLimit,
    #[msg("InvalidSignature")]
    InvalidSignature,
    #[msg("Signature verification failed.")]
    SigVerificationFailed,
    #[msg("Invalid priceDecimals.")]
    InvalidPriceDecimals,

}

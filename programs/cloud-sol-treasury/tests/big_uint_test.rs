use anchor_lang::prelude::msg;
use num_bigint::{BigUint};
use std::ops::{Div, Mul};

#[test]
fn time() {
    let i: u64 = 1000;
    let j: u64 = BigUint::from(i).mul(i).div(i).to_string().parse().unwrap();
    msg!("BigUint {}",j);
}

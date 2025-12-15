---
applyTo: "crates/**/*.rs,crates/bootforge-usb/libbootforge/**/*.rs,crates/bootforge-usb/bootforge-cli/**/*.rs,crates/bootforge-usb/bootforge-usb-builder/**/*.rs,crates/bootforge-usb/trapdoor-cli/**/*.rs,**/Cargo.toml"
---

# Rust Crates Rules

- No panics in core paths; use Result and propagate errors.
- Avoid unsafe; if required, isolate and justify.
- Keep public APIs stable unless task demands change.

## Validation (preferred)
- cargo fmt
- cargo clippy --all-targets --all-features
- cargo test

If workspace layout is nonstandard, discover the correct workspace commands from Cargo.toml files.

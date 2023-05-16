# surrealdb_in_browser
using a wasm compiled version of surreal db from rust

Install rust using recommended procedure
    https://www.rust-lang.org/tools/install
    linux: curl https://sh.rustup.rs -sSf | sh

Install wasm toolchain
    rustup target add wasm32-unknown-unknown

Install OpenSSL and others
    sudo apt install libssl-dev
    sudo apt install openssl

Open cargo.toml and change version of wasm-bindgen to "0.2.86"

Install wasm-pack
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh


Build using wasm-pack
    wasm-pack build --target=web

A pkg directory is created. Copy the contents to a hosted directory and run the index.html in browser

Open the console and observe the instance output

{memory: Memory(26), setup: ƒ, __wbg_surreal_free: ƒ, surreal_init: ƒ, surreal_connect: ƒ, …}

import {
  buildCreateTokenTransaction,
  buildMintTokensTransaction,
  Token2022Account,
  TOKEN_2022_PROGRAM_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
} from "gill/programs/token";
import { loadKeypairSignerFromFile } from "gill/node";
import {
  createSolanaClient,
  generateKeyPairSigner,
  getExplorerLink,
  getSignatureFromTransaction,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "gill";

// default file path: ~/.config/solana/id.json
const signer = await loadKeypairSignerFromFile(
  "../ptdBz8tigiKVLoAvmDzh2ShzHeM2qaYQwSN3atpbJTG.json"
);
console.log("address:", signer.address);
const { rpc, sendAndConfirmTransaction, simulateTransaction } =
  createSolanaClient({
    urlOrMoniker: "devnet",
  });

const mintKeypair = await generateKeyPairSigner();
console.log("mintKeypair", mintKeypair);
//   const ata = await getAssociatedTokenAccountAddress(
//     mintKeypair.address,
//     signer.address,
//     TOKEN_PROGRAM_ADDRESS
//   );

process.env.GILL_DEBUG_LEVEL;
/*
*For custom rpc provider:
----------------------------------

const { rpc, rpcSubscriptions, sendAndConfirmTransaction } = createSolanaClient({
  urlOrMoniker: "https://private-solana-rpc-provider.com",
});

*/
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const createTokenTx = await buildCreateTokenTransaction({
  feePayer: signer,
  latestBlockhash,
  mint: mintKeypair,
  // mintAuthority, // default=same as the `feePayer`
  metadata: {
    isMutable: true, // if the `updateAuthority` can change this metadata in the future
    name: "Planted Tree",
    symbol: "PLANTD",
    uri: "https://purple-eldest-shark-702.mypinata.cloud/ipfs/bafkreihnuggcoacokgkwizwdmbru4q5nnp25uk5dnbxeyk4b2hmyszp7my",
  },
  // updateAuthority, // default=same as the `feePayer`
  decimals: 6, // default=9,
  tokenProgram: TOKEN_PROGRAM_ADDRESS, // default=TOKEN_PROGRAM_ADDRESS, token22 also supported
  // default cu limit set to be optimized, but can be overriden here
  // computeUnitLimit?: number,
  // obtain from your favorite priority fee api
  // computeUnitPrice?: number, // no default set
});

// console.log("createTokenTx", createTokenTx);
process.env.GILL_DEBUG = "true";
// const signedTransaction = await signTransactionMessageWithSigners(
//   createTokenTx
// );
// const signature: string = getSignatureFromTransaction(signedTransaction);

// console.log(getExplorerLink({ transaction: signature }));

// const simulation = await simulateTransaction(createTokenTx);

// console.log("simulation", simulation);

// // // default commitment level of `confirmed`
// const confSign = await sendAndConfirmTransaction(signedTransaction);
// console.log("Confirm Sign :", confSign);

const signedTransaction = await signTransactionMessageWithSigners(
  setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, createTokenTx)
);
const signature: string = getSignatureFromTransaction(signedTransaction);

console.log(getExplorerLink({ transaction: signature }));

// default commitment level of `confirmed`
await sendAndConfirmTransaction(signedTransaction);
console.log("signedTransaction", signedTransaction);

// --------------------------------------------

const mintTokensTx = await buildMintTokensTransaction({
  feePayer: signer,
  latestBlockhash,
  mint: mintKeypair,
  mintAuthority: signer,
  amount: 10000000, // note: be sure to consider the mint's `decimals` value
  // if decimals=2 => this will mint 10.00 tokens
  // if decimals=4 => this will mint 0.100 tokens
  destination: mintKeypair.address,
  // use the correct token program for the `mint`
  tokenProgram: TOKEN_PROGRAM_ADDRESS, // default=TOKEN_PROGRAM_ADDRESS
  // default cu limit set to be optimized, but can be overriden here
  // computeUnitLimit?: number,
  // obtain from your favorite priority fee api
  // computeUnitPrice?: number, // no default set
});

console.log("mintTokensTx", mintTokensTx);
process.env.GILL_DEBUG = "true";

const signedTransaction1 = await signTransactionMessageWithSigners(
  setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, mintTokensTx)
);
const signature1: string = getSignatureFromTransaction(signedTransaction1);
console.log(getExplorerLink({ transaction: signature1 }));

// default commitment level of `confirmed`
const confSign = await sendAndConfirmTransaction(signedTransaction);
console.log("Confirm Sign :", confSign);

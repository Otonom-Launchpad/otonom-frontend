"use strict";
/**
 * Otonom Fund Program Initialization Script
 * For Program ID: CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf
 *
 * This script performs all necessary one-time initializations after deploying a new version
 * of the Otonom Fund Solana program. It follows a specific sequence:
 *
 * 1. Initialize the OFUND token mint authority
 * 2. Create a sample project for testing
 * 3. Initialize the admin user profile
 *
 * Usage:
 *   npx ts-node scripts/init-all-CWYLQ.ts
 *
 * Requirements:
 *   - Solana CLI with a configured wallet (solana-keygen)
 *   - Node.js v16+
 *   - The wallet must have SOL for transaction fees
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_js_1 = require("@solana/web3.js");
var fs_1 = require("fs");
var path = __importStar(require("path"));
var anchor = __importStar(require("@project-serum/anchor"));
var spl_token_1 = require("@solana/spl-token");
// Import IDL directly with require instead of ESM import
// eslint-disable-next-line @typescript-eslint/no-var-requires
var idlFile = require('../../src/idl/spg/ofund-idl-deployed.json');
// =========== Configuration constants ===========
// Program ID for the Otonom Fund program
var PROGRAM_ID = new web3_js_1.PublicKey('CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');
// OFUND token mint address
var OFUND_MINT = new web3_js_1.PublicKey('4pV3umk8pY62ry8FsnMbQfJBYgpWnzWcC67UCMUevXLY');
// Network to connect to
var NETWORK = 'devnet';
// Sample project name to initialize
var SAMPLE_PROJECT_NAME = 'Demo Project';
// Path to your Solana wallet keypair
var WALLET_KEYPAIR_PATH = path.resolve(process.env.HOME || '', '.config/solana/id.json');
// Create Anchor instruction coder for generating discriminators
var instructionCoder = new anchor.BorshInstructionCoder(idlFile);
// Instruction discriminators (first 8 bytes of serialized instructions)
var INSTRUCTION_DISCRIMINATORS = {
    initializeExistingMint: instructionCoder.encode('initializeExistingMint', {}).slice(0, 8),
    registerUser: instructionCoder.encode('registerUser', {}).slice(0, 8),
    initializeProject: instructionCoder.encode('initializeProject', {}).slice(0, 8),
};
// =========== Helper Functions ===========
/**
 * Get Solana connection
 * @returns {Connection} Solana connection
 */
function getConnection() {
    var endpoint = NETWORK === 'devnet'
        ? 'https://api.devnet.solana.com'
        : 'https://api.mainnet-beta.solana.com';
    console.log("Creating Solana connection for network: ".concat(NETWORK));
    console.log("Using RPC endpoint: ".concat(endpoint));
    return new web3_js_1.Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
    });
}
/**
 * Find mint authority PDAs
 * @returns {Promise<[PublicKey, PublicKey, number]>} [mintAuthorityPDA, authorityAccountPDA, bump]
 */
function findMintAuthorityPDAs() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, mintAuthorityPda, mintAuthorityBump, _b, authorityAccountPda, authorityBump;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([Buffer.from('mint-authority'), OFUND_MINT.toBuffer()], PROGRAM_ID)];
                case 1:
                    _a = _c.sent(), mintAuthorityPda = _a[0], mintAuthorityBump = _a[1];
                    return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([Buffer.from('authority'), OFUND_MINT.toBuffer()], PROGRAM_ID)];
                case 2:
                    _b = _c.sent(), authorityAccountPda = _b[0], authorityBump = _b[1];
                    return [2 /*return*/, [mintAuthorityPda, authorityAccountPda, authorityBump]];
            }
        });
    });
}
/**
 * Find user profile PDA
 * @param {PublicKey} user - User public key
 * @returns {Promise<[PublicKey, number]>} [userProfilePDA, bump]
 */
function findUserProfilePDA(user) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, pda, bump;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([Buffer.from('user-profile'), user.toBuffer()], PROGRAM_ID)];
                case 1:
                    _a = _b.sent(), pda = _a[0], bump = _a[1];
                    return [2 /*return*/, [pda, bump]];
            }
        });
    });
}
/**
 * Find project PDA
 * @param {string} projectName - Project name
 * @returns {Promise<[PublicKey, number]>} [projectPDA, bump]
 */
function findProjectPDA(projectName) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, pda, bump;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([Buffer.from('project'), Buffer.from(projectName)], PROGRAM_ID)];
                case 1:
                    _a = _b.sent(), pda = _a[0], bump = _a[1];
                    return [2 /*return*/, [pda, bump]];
            }
        });
    });
}
/**
 * Create instruction to initialize an existing mint with program authority
 * @param {PublicKey} admin - Admin wallet
 * @param {PublicKey} mint - Token mint
 * @param {number} authorityBump - Authority bump
 * @param {string} tokenName - Token name
 * @param {string} tokenSymbol - Token symbol
 * @param {string} tokenUri - Token metadata URI
 * @returns {Instruction} Instruction object
 */
function createInitializeExistingMintIx(admin, mint, authorityBump, tokenName, tokenSymbol, tokenUri) {
    console.log("Creating initialize existing mint instruction for: ".concat(mint.toString()));
    // Find the mint authority PDAs
    var _a = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('mint-authority'), mint.toBuffer()], PROGRAM_ID), mintAuthorityPda = _a[0], mintAuthority = _a[1];
    // Create buffers for strings
    var nameBuffer = Buffer.from(tokenName);
    var nameLength = Buffer.alloc(4);
    nameLength.writeUInt32LE(nameBuffer.length, 0);
    var symbolBuffer = Buffer.from(tokenSymbol);
    var symbolLength = Buffer.alloc(4);
    symbolLength.writeUInt32LE(symbolBuffer.length, 0);
    var uriBuffer = Buffer.from(tokenUri);
    var uriLength = Buffer.alloc(4);
    uriLength.writeUInt32LE(uriBuffer.length, 0);
    // Create the instruction data
    var instructionData = Buffer.concat([
        INSTRUCTION_DISCRIMINATORS.initializeExistingMint,
        Buffer.from([authorityBump]),
        nameLength,
        nameBuffer,
        symbolLength,
        symbolBuffer,
        uriLength,
        uriBuffer
    ]);
    // Define accounts according to IDL - with proper typing
    var keys = [
        { pubkey: admin, isSigner: true, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: mintAuthorityPda, isSigner: false, isWritable: false },
        { pubkey: new web3_js_1.PublicKey(mintAuthority), isSigner: false, isWritable: true },
        { pubkey: spl_token_1.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: web3_js_1.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    return new web3_js_1.TransactionInstruction({
        programId: PROGRAM_ID,
        keys: keys,
        data: instructionData
    });
}
/**
 * Create instruction to register a user profile
 * @param {PublicKey} user - User wallet
 * @param {PublicKey} userProfilePda - User profile PDA
 * @param {number} bump - PDA bump
 * @returns {TransactionInstruction} Transaction instruction
 */
function createRegisterUserIx(user, userProfilePda, bump) {
    console.log("Creating register user instruction for: ".concat(user.toString()));
    // Find the mint authority PDAs
    var _a = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('mint-authority'), OFUND_MINT.toBuffer()], PROGRAM_ID), mintAuthorityPda = _a[0], mintAuthority = _a[1];
    // Format instruction data: [8 bytes discriminator][1 byte bump]
    var instructionData = Buffer.concat([
        INSTRUCTION_DISCRIMINATORS.registerUser,
        Buffer.from([bump]), // userBump argument from IDL
    ]);
    // Define accounts needed based on the IDL for registerUser - with proper typing
    var keys = [
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: userProfilePda, isSigner: false, isWritable: true },
        { pubkey: OFUND_MINT, isSigner: false, isWritable: true },
        { pubkey: new web3_js_1.PublicKey(user), isSigner: false, isWritable: true }, // Properly cast to PublicKey
        { pubkey: new web3_js_1.PublicKey(mintAuthority), isSigner: false, isWritable: false },
        { pubkey: mintAuthorityPda, isSigner: false, isWritable: false },
        { pubkey: spl_token_1.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: web3_js_1.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    return new web3_js_1.TransactionInstruction({
        programId: PROGRAM_ID,
        keys: keys,
        data: instructionData
    });
}
/**
 * Create instruction to initialize a project
 * @param {PublicKey} authority - Project authority
 * @param {PublicKey} projectPda - Project PDA
 * @param {number} bump - PDA bump
 * @param {string} projectName - Project name
 * @returns {TransactionInstruction} Transaction instruction
 */
function createInitializeProjectIx(authority, projectPda, bump, projectName) {
    console.log("Creating initialize project instruction for: ".concat(projectName));
    // Create a buffer for the project name
    var nameBuffer = Buffer.from(projectName);
    var nameLenBuffer = Buffer.alloc(4);
    nameLenBuffer.writeUInt32LE(nameBuffer.length, 0);
    // Create the bump buffer
    var bumpBuffer = Buffer.from([bump]);
    // Construct the final instruction data
    var instructionData = Buffer.concat([
        INSTRUCTION_DISCRIMINATORS.initializeProject,
        nameLenBuffer, // 4-byte length prefix for string
        nameBuffer, // actual string bytes
        bumpBuffer, // Bump as u8
    ]);
    // Define accounts according to IDL - with proper typing
    var keys = [
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: projectPda, isSigner: false, isWritable: true },
        { pubkey: new web3_js_1.PublicKey(authority), isSigner: false, isWritable: true }, // Properly cast to PublicKey
        { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: web3_js_1.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    return new web3_js_1.TransactionInstruction({
        programId: PROGRAM_ID,
        keys: keys,
        data: instructionData
    });
}
/**
 * Main function to run all initializations
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var walletKeypair, connection, balance, _a, mintAuthorityPda, mintAuthority, authorityBump, mintAuthorityInfo, tx, initMintIx, blockhash, signature, _b, userProfilePda, userProfileBump, userProfileInfo, _c, projectPda, projectBump, projectInfo, tx, projectIx, blockhash, signature, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 18, , 19]);
                    console.log('======== Otonom Fund Program Initialization ========');
                    console.log("Program ID: ".concat(PROGRAM_ID.toString()));
                    console.log("OFUND Token Mint: ".concat(OFUND_MINT.toString()));
                    console.log("Network: ".concat(NETWORK));
                    console.log('==================================================');
                    walletKeypair = web3_js_1.Keypair.fromSecretKey(Buffer.from(JSON.parse((0, fs_1.readFileSync)(WALLET_KEYPAIR_PATH, 'utf-8'))));
                    console.log("Using wallet: ".concat(walletKeypair.publicKey.toString()));
                    connection = getConnection();
                    return [4 /*yield*/, connection.getBalance(walletKeypair.publicKey)];
                case 1:
                    balance = _d.sent();
                    console.log("Wallet balance: ".concat(balance / 1000000000, " SOL"));
                    if (balance < 10000000) {
                        console.error('Warning: Wallet balance is low. Minimum 0.01 SOL recommended for transactions.');
                        // Don't stop execution, but warn the user
                    }
                    // ======== Step 1: Initialize OFUND Token Mint Authority ========
                    console.log('\n\n📝 Step 1: Initializing OFUND Token Mint Authority...');
                    return [4 /*yield*/, findMintAuthorityPDAs()];
                case 2:
                    _a = _d.sent(), mintAuthorityPda = _a[0], mintAuthority = _a[1], authorityBump = _a[2];
                    console.log("Mint Authority PDA: ".concat(mintAuthorityPda.toString()));
                    console.log("Authority Account: ".concat(mintAuthority.toString()));
                    return [4 /*yield*/, connection.getAccountInfo(mintAuthority)];
                case 3:
                    mintAuthorityInfo = _d.sent();
                    if (!mintAuthorityInfo) return [3 /*break*/, 4];
                    console.log('✓ Mint authority already initialized, skipping...');
                    return [3 /*break*/, 8];
                case 4:
                    console.log('Initializing mint authority...');
                    tx = new web3_js_1.Transaction();
                    initMintIx = createInitializeExistingMintIx(walletKeypair.publicKey, OFUND_MINT, authorityBump, "OFUND Token", "OFUND", "https://otonom.fund/token");
                    tx.add(initMintIx);
                    // Set fee payer and recent blockhash
                    tx.feePayer = walletKeypair.publicKey;
                    return [4 /*yield*/, connection.getRecentBlockhash()];
                case 5:
                    blockhash = (_d.sent()).blockhash;
                    tx.recentBlockhash = blockhash;
                    // Sign and send transaction
                    tx.sign(walletKeypair);
                    return [4 /*yield*/, connection.sendRawTransaction(tx.serialize())];
                case 6:
                    signature = _d.sent();
                    console.log("Transaction sent! Signature: ".concat(signature));
                    console.log("View on Solana Explorer: https://explorer.solana.com/tx/".concat(signature, "?cluster=").concat(NETWORK));
                    // Wait for confirmation
                    console.log('Waiting for transaction confirmation...');
                    return [4 /*yield*/, connection.confirmTransaction(signature)];
                case 7:
                    _d.sent();
                    console.log('✓ Mint authority initialized successfully!');
                    _d.label = 8;
                case 8:
                    // ======== Step 2: Initialize User Profile ========
                    console.log('\n\n📝 Step 2: Initializing User Profile...');
                    return [4 /*yield*/, findUserProfilePDA(walletKeypair.publicKey)];
                case 9:
                    _b = _d.sent(), userProfilePda = _b[0], userProfileBump = _b[1];
                    console.log("User Profile PDA: ".concat(userProfilePda.toString()));
                    return [4 /*yield*/, connection.getAccountInfo(userProfilePda)];
                case 10:
                    userProfileInfo = _d.sent();
                    if (userProfileInfo) {
                        console.log('✓ User profile already initialized, skipping...');
                    }
                    else {
                        console.log('Note: User profiles are automatically created when investing, so this step is optional.');
                        console.log('Initialization will be handled when the first investment is made.');
                    }
                    // ======== Step 3: Initialize Sample Project ========
                    console.log('\n\n📝 Step 3: Initializing Sample Project...');
                    return [4 /*yield*/, findProjectPDA(SAMPLE_PROJECT_NAME)];
                case 11:
                    _c = _d.sent(), projectPda = _c[0], projectBump = _c[1];
                    console.log("Project PDA: ".concat(projectPda.toString()));
                    return [4 /*yield*/, connection.getAccountInfo(projectPda)];
                case 12:
                    projectInfo = _d.sent();
                    if (!projectInfo) return [3 /*break*/, 13];
                    console.log("\u2713 Sample project \"".concat(SAMPLE_PROJECT_NAME, "\" already initialized, skipping..."));
                    return [3 /*break*/, 17];
                case 13:
                    // Create an ATA for project vault
                    // Note: This step is simplified for this script
                    // In a real app, we'd create the ATA first
                    console.log("Initializing sample project: \"".concat(SAMPLE_PROJECT_NAME, "\"..."));
                    console.log('Note: This requires a second step to configure in the database');
                    tx = new web3_js_1.Transaction();
                    projectIx = createInitializeProjectIx(walletKeypair.publicKey, projectPda, projectBump, SAMPLE_PROJECT_NAME);
                    tx.add(projectIx);
                    // Set fee payer and recent blockhash
                    tx.feePayer = walletKeypair.publicKey;
                    return [4 /*yield*/, connection.getRecentBlockhash()];
                case 14:
                    blockhash = (_d.sent()).blockhash;
                    tx.recentBlockhash = blockhash;
                    // Sign and send transaction
                    tx.sign(walletKeypair);
                    return [4 /*yield*/, connection.sendRawTransaction(tx.serialize())];
                case 15:
                    signature = _d.sent();
                    console.log("Transaction sent! Signature: ".concat(signature));
                    console.log("View on Solana Explorer: https://explorer.solana.com/tx/".concat(signature, "?cluster=").concat(NETWORK));
                    // Wait for confirmation
                    console.log('Waiting for transaction confirmation...');
                    return [4 /*yield*/, connection.confirmTransaction(signature)];
                case 16:
                    _d.sent();
                    console.log("\u2713 Sample project \"".concat(SAMPLE_PROJECT_NAME, "\" initialized successfully!"));
                    _d.label = 17;
                case 17:
                    // ======== Final Steps ========
                    console.log('\n\n✅ Program Initialization Complete!');
                    console.log('==================================================');
                    console.log('Next steps:');
                    console.log('1. Add the sample project to your database if needed');
                    console.log('2. Test the investment flow with a connected wallet');
                    console.log('==================================================');
                    return [3 /*break*/, 19];
                case 18:
                    error_1 = _d.sent();
                    console.error('Error during program initialization:', error_1);
                    if (error_1 && typeof error_1 === 'object' && 'logs' in error_1) {
                        console.error('Program logs:', error_1.logs);
                    }
                    return [3 /*break*/, 19];
                case 19: return [2 /*return*/];
            }
        });
    });
}
// Run the main function
main().catch(function (err) {
    console.error('Fatal error:', err);
    process.exit(1);
});

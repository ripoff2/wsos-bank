import { FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  AnchorProvider,
  BN,
  Program,
  utils,
  web3,
} from "@project-serum/anchor";
import idl from "./solanapdas.json";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { notify } from "../utils/notifications";

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new web3.PublicKey(idl.metadata.address);

export const Bank: FC = () => {
  const ourWallet = useWallet();
  const { connection } = useConnection();

  const [banks, setBanks] = useState([]);

  const getProvider = () => {
    return new AnchorProvider(
      connection,
      ourWallet,
      AnchorProvider.defaultOptions()
    );
  };

  const createBank = async () => {
    try {
      const anchProvider = getProvider();

      const program = new Program(idl_object, programID, anchProvider);

      const [bank] = PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("bankaccount"),
          anchProvider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.rpc.create("WsoS Bank", {
        accounts: {
          bank,
          user: anchProvider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        },
      });

      notify({
        message: "Bank created",
        description: "Your bank has been created",
        type: "success",
      });
    } catch (e) {
      notify({
        message: "Error creating bank",
        description: e.message,
        type: "error",
      });
    }
  };

  const withdraw = async () => {
    try {
      const anchProvider = getProvider();

      const program = new Program(idl_object, programID, anchProvider);

      const [bank] = PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("bankaccount"),
          anchProvider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const bankAccount = await connection.getAccountInfo(bank, "confirmed");

      const minBalanceForRent =
        await connection.getMinimumBalanceForRentExemption(
          bankAccount.data.length
        );

      const bankBalance = await connection.getBalance(bank);

      await program.rpc.withdraw(new BN(bankBalance - minBalanceForRent), {
        accounts: {
          bank,
          user: anchProvider.wallet.publicKey,
        },
      });

      notify({
        message: "Bank withdraw",
        description: "Your bank has been withdraw",
        type: "success",
      });
    } catch (e) {
      notify({
        message: "Error withdraw bank",
        description: e.message,
        type: "error",
      });
    }
  };

  const getBanks = async () => {
    const anchProvider = getProvider();
    const program = new Program(idl_object, programID, anchProvider);

    try {
      Promise.all(
        (await connection.getProgramAccounts(programID)).map(async (bank) => ({
          ...(await program.account.bank.fetch(bank.pubkey)),
          pubkey: bank.pubkey,
        }))
      ).then((banks) => {
        setBanks(banks);
      });
    } catch (e) {
      notify({
        message: "Error getting banks",
        description: e.message,
        type: "error",
      });
    }
  };

  const depositBank = async (publicKey) => {
    try {
      const anchProvider = getProvider();

      const program = new Program(idl_object, programID, anchProvider);

      await program.rpc.deposit(new BN(0.1 * LAMPORTS_PER_SOL), {
        accounts: {
          bank: publicKey,
          user: anchProvider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        },
      });
    } catch (e) {
      notify({
        message: "Error depositing bank",
        description: e.message,
        type: "error",
      });
    }
  };

  return (
    <>
      {banks.map((bank) => {
        return (
          // eslint-disable-next-line react/jsx-key
          <div className="md: hero-content flex flex-col">
            <h1>{bank.name.toString()}</h1>
            <span>{bank.balance.toString()}</span>
            <button
              className="group w-60 m-2 btn animate-pulse bg-gradient-to-r from-purple-900 to-emerald-400"
              onClick={() => depositBank(bank.pubkey)}
            >
              <span>Deposit 0.1</span>
            </button>
          </div>
        );
      })}
      <div className="flex flex-row justify-center">
        <>
          <div className="relative group items-center">
            <div
              className="m1 absolute -inset-0.5 bg-gradient-to-r from-purple-900 to-emerald-400
                rounded-lg  opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
            >
              <button
                className="group w-60 m-2 btn animate-pulse bg-gradient-to-r from-purple-900 to-emerald-400"
                onClick={createBank}
              >
                <span className="block group-disabled:hidden">Create Bank</span>
              </button>

              <button
                className="group w-60 m-2 btn animate-pulse bg-gradient-to-r from-purple-900 to-emerald-400"
                onClick={getBanks}
              >
                <span className="block group-disabled:hidden">Get Banks</span>
              </button>

              <button
                className="group w-60 m-2 btn animate-pulse bg-gradient-to-r from-purple-900 to-emerald-400"
                onClick={withdraw}
              >
                <span className="block group-disabled:hidden">Withdraw</span>
              </button>
            </div>
          </div>
        </>
      </div>
    </>
  );
};

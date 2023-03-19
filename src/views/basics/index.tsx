import { FC } from "react";
import { Bank} from "../../components/Bank";

export const BasicsView: FC = ({ }) => {

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold bg-clip-text bg-gradient-to-br from-neutral-500 to-red-500 mt-10 mb-8">
          Solana Bank
        </h1>
        <div className="text-center">
            <Bank />
        </div>
      </div>
    </div>
  );
};

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import createConnectorSlice from "./create-connector-slice";
import createGlobalAppStateSlice from "./create-global-app-state-slice";

type StateFromFunctions<T extends [...any]> = T extends [infer F, ...infer R]
  ? F extends (...args: any) => object
    ? StateFromFunctions<R> & ReturnType<F>
    : unknown
  : unknown;

type State = StateFromFunctions<
  [typeof createGlobalAppStateSlice, typeof createConnectorSlice]
>;

const useStore = create<State>()(
  devtools(
    (set, get, store) => ({
      ...createGlobalAppStateSlice(set, get, store),
      ...createConnectorSlice(set, get, store),
    }),
    { name: "Crystalrohr" }
  )
);

export default useStore;

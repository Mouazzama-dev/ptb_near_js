import { NearBindgen, near, call, view} from 'near-sdk-js';

@NearBindgen({})
class Minter {
  static OWNER_KEY = 'owner';
  static MONTH_DURATION = 30 * 24 * 60 * 60 * 1000;

  static EMISSIONS_ACCOUNT_KEY = 'emissionsAccount';
  static LOOT_RAFFLE_POOL_KEY = 'lootRafflePool';
  static GLOBAL_TAPPING_POOL_KEY = 'globalTappingPool';

  // Initialize emission and pool accounts and set owner
  @call({})
  initialize({ owner }) {
    if (near.storageRead(Minter.OWNER_KEY)) {
      throw new Error("Contract is already initialized");
    }

    near.storageWrite(Minter.OWNER_KEY, owner);
    near.storageWrite(Minter.EMISSIONS_ACCOUNT_KEY, JSON.stringify({
      initialEmissions: '3000000000',
      decayFactor: 0.8705505633,
      currentMonth: 0,
      currentEmissions: '3000000000',
      lastMintTimestamp: Date.now(),
    }));
    near.storageWrite(Minter.LOOT_RAFFLE_POOL_KEY, JSON.stringify({
      poolId: 1,
      amount: '50000000000000',
      totalAmount: '0',
    }));
    near.storageWrite(Minter.GLOBAL_TAPPING_POOL_KEY, JSON.stringify({
      poolId: 2,
      amount: '100000000000000',
    }));
  }

  // Check if the caller is the owner
  isOwner() {
    const owner = near.storageRead(Minter.OWNER_KEY);
    return near.predecessorAccountId() === owner;
  }

  // Example of a function using the isOwner check
  @view({})
  getEmissionsAccount() {
    const emissionsAccount = near.storageRead(Minter.EMISSIONS_ACCOUNT_KEY);
    return emissionsAccount ? JSON.parse(emissionsAccount) : null;
  }
}

import { NearBindgen, near, call, view } from 'near-sdk-js';
import { ft_transfer_impl, ft_mint_impl } from "openblimp";
import { u128 } from "near-sdk-as";

@NearBindgen({})
class Minter {
  static OWNER_KEY = 'owner';
  static MONTH_DURATION = 30 * 24 * 60 * 60 * 1000;

  static EMISSIONS_ACCOUNT_KEY = 'emissionsAccount';
  static LOOT_RAFFLE_POOL_KEY = 'lootRafflePool';
  static GLOBAL_TAPPING_POOL_KEY = 'globalTappingPool';
  static BUCKETS_KEY = 'buckets';

  // Predefined amounts for each bucket
  static BUCKET_AMOUNTS = {
    "Seed Round": "6900000000000000",
    "Private Sale": "6900000000000000",
    "KOL Round": "3450000000000000",
    "Public Sale": "10350000000000000",
    "Airdrop": "6900000000000000",
    "Team and Advisors": "3450000000000000",
    "Strategic Partnerships": "3450000000000000",
  };

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
    near.storageWrite(Minter.BUCKETS_KEY, JSON.stringify({}));
  }

  // Check if the caller is the owner
  isOwner() {
    const owner = near.storageRead(Minter.OWNER_KEY);
    return near.predecessorAccountId() === owner;
  }

  // Set bucket address (only once per bucket)
  @call({})
  setBucketAddress({ bucket, address }) {
    if (!this.isOwner()) {
      throw new Error("Only the owner can set bucket addresses.");
    }

    let buckets = JSON.parse(near.storageRead(Minter.BUCKETS_KEY) || '{}');
    if (buckets[bucket]) {
      throw new Error("Bucket address has already been set.");
    }

    // Validate that the bucket name is valid
    if (!(bucket in Minter.BUCKET_AMOUNTS)) {
      throw new Error("Invalid bucket name.");
    }

    buckets[bucket] = address;
    near.storageWrite(Minter.BUCKETS_KEY, JSON.stringify(buckets));
  }

  // Transfer tokens to the bucket address
  @call({})
  transferToBucket({ bucket }) {
    if (!this.isOwner()) {
      throw new Error("Only the owner can transfer to bucket addresses.");
    }

    const buckets = JSON.parse(near.storageRead(Minter.BUCKETS_KEY) || '{}');
    const bucketAddress = buckets[bucket];
    if (!bucketAddress) {
      throw new Error("Bucket address is not set.");
    }

    const amount = Minter.BUCKET_AMOUNTS[bucket];
    if (!amount) {
      throw new Error("Invalid bucket name or amount not specified.");
    }

    // Perform the transfer
    ft_transfer_impl(bucketAddress, u128.from(amount), `Transfer to ${bucket} bucket`);
  }

  // Mint tokens for a specific bucket
  @call({})
  mintToBucket({ bucket }) {
    if (!this.isOwner()) {
      throw new Error("Only the owner can mint to bucket addresses.");
    }

    const buckets = JSON.parse(near.storageRead(Minter.BUCKETS_KEY) || '{}');
    const bucketAddress = buckets[bucket];
    if (!bucketAddress) {
      throw new Error("Bucket address is not set.");
    }

    const amount = Minter.BUCKET_AMOUNTS[bucket];
    if (!amount) {
      throw new Error("Invalid bucket name or amount not specified.");
    }

    // Mint tokens to the specified bucket address
    ft_mint_impl(bucketAddress, u128.from(amount));
  }

  // Example of a function using the isOwner check
  @view({})
  getEmissionsAccount() {
    const emissionsAccount = near.storageRead(Minter.EMISSIONS_ACCOUNT_KEY);
    return emissionsAccount ? JSON.parse(emissionsAccount) : null;
  }
  
  @view({})
  getBucketAddress({ bucket }) {
    const buckets = JSON.parse(near.storageRead(Minter.BUCKETS_KEY) || '{}');
    return buckets[bucket] || null;
  }
}

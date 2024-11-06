import { NearBindgen, call, view} from 'near-sdk-js';
import { 
  ft_initialize_impl, ft_transfer_impl, ft_transfer_call_impl, 
  ft_total_supply_impl, ft_balance_of_impl, ft_metadata_impl,
  storage_deposit_impl, storage_withdraw_impl, storage_unregister_impl, 
  storage_balance_of_impl, storage_balance_bounds_impl, 
  FungibleTokenStorageBalance, FungibleTokenStorageBalanceBounds 
} from "openblimp";
import { u128, context } from "near-sdk-as";

// Base64 encoded SVG for token icon (optional)
const base64TokenSvg = "data:image/svg+xml;base64,..."; // Replace with actual SVG if needed

@NearBindgen({})
class TokenContract {
  // Initialize the fungible token with metadata
  @call({})
  ft_initialize() {
    ft_initialize_impl("Push Token", "PUSH", 18, base64TokenSvg, "", "");
  }

  // Standard NEP-141 functions
  @view({})
  ft_total_supply() {
    return ft_total_supply_impl().toString();
  }

  @view({})
  ft_balance_of({ account_id }) {
    return ft_balance_of_impl(account_id).toString();
  }

  @call({})
  ft_transfer({ receiver_id, amount, memo = "" }) {
    ft_transfer_impl(receiver_id, u128.from(amount), memo);
  }

  @call({})
  ft_transfer_call({ receiver_id, amount, msg, memo = "" }) {
    ft_transfer_call_impl(receiver_id, u128.from(amount), msg, memo);
  }

  // Token metadata
  @view({})
  ft_metadata() {
    return ft_metadata_impl();
  }

  // Storage management functions
  @call({})
  storage_deposit({ account_id = context.predecessor, registration_only = false }) {
    return storage_deposit_impl(account_id, registration_only);
  }

  @call({})
  storage_withdraw({ amount = null }) {
    return storage_withdraw_impl(amount);
  }

  @call({})
  storage_unregister({ force = false }) {
    return storage_unregister_impl(force);
  }

  @view({})
  storage_balance_of({ account_id }) {
    return storage_balance_of_impl(account_id);
  }

  @view({})
  storage_balance_bounds() {
    return storage_balance_bounds_impl();
  }
}

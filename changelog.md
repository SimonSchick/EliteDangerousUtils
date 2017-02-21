# 1.0.0
- Initial release

# 1.1.0
- Fixed demo functionality by adding @types/node dependency
- Added backlog processing via `.start(true)` on EDLog class, returns array of events.
- Added 8 new events
    - `ModuleBuy`
    - `SellExplorationData`
    - `RefuelAll`
    - `BuyAmmo`
    - `ShieldState`
    - `DockingGranted`
    - `MarketBuy`
    - `MarketSell`
- Fixed typos in events:
    - `MaterialCollected` and `MaterialDiscarded`

# 1.2.0
- Made Companion API demo more useful.
    - Now prompts for input via stderr and prints json payload into stdout as pretty print.
    - Added `ICargoItem`
    - Made `modules` on `IAPIShip` more specific, spefication coming soon.

# 1.3.0
- Added events:
    - `DockingRequested`
    - `Docked`
    - `Undocked`
    - `USSDrop`
    - `Touchdown`
    - `Liftoff`
    - `EngineerCraft`
    - `EngineerApply`
    - `EngineerProgress`
    - `HullDamage`
    - `Interdicted`
    - `LaunchFighter`
    - `RepairAll`
    - `Location`
    - `Fileheader`
    - `ShipyardSell`
    - `ShipyardSwap`
    - `ShipyardTransfer`
- Added unknown event logging to demo:
- Fixed backlog incorrect ordering.

# 1.4.0
- Added events:
    - `EjectCargo`
    - `HeatWarning`
    - `Screenshot`
    - `RedeemVoucher`
    - `PayLegacyFines`
    - `RebootRepair`
    - `Materialdiscovered`
- Fixed typo in `Security` type export.
- Completed body types and moved them into own type.
- Added `wing` to `ReceiveText` and `SendText` channels.
- Added `To_Localised` to `SendText`
- Completed `CrimeType` in `CommitCrime` and added `Fine` parameter, made `Bounty` optional
- Completed `StationType`.
- Completed `USSType`.
- Added another fighter loadout string.

## Demo
- Randomized material selection for large material sets.
- Removed hard-coded list for events, pulls from source instead.
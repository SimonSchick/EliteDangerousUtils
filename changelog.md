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

# 1.5.0
- Automated publishing malfunctioned.

## Demo
- Randomized material selection for large material sets.
- Removed hard-coded list for events, pulls from source instead.

# 1.6.0
- Added powers list type.
- Completed module list in EDCompanionApp and module type through common definitions file.

# 1.7.0
- Fixed corrupted build.
- Added missing lodash dev dependency

# 1.8.0
- Added events:
    - `DockingCancelled`
    - `DockingDenied`
    - `DockingTimeout`
    - `NewCommander`
    - `ClearSavedGame`
    - `DockingCancelled`
    - `Syntheses`
    - `DockSRV`
    - `Died`
    - `Resurrect`
    - `JoinPower`
    - `DatalinkScan`
    - `DatalinkVoucher`
    - `ModuleSell`
    - `WingAdd`
    - `WingJoin`
    - `WingLeave`
    - `CrewAssign`
    - `ModuleSellRemote`
    - `DockFighter`
    - `VehicleSwitch`
    - `RestockVehicle`
- Simplied some interface for docking related events
- Fixed demo startup script
- Fixed `CMDR` not being replaced
- Moved some event member types to dedicated types

# 1.9.0
- Added events:
    - `FetchRemoteModule`

- Fixed handling of different commander messages in ReceiveText in demo.

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
    - `IMarketBuy`
    - `IMarketSell`
- Fixed typos in events:
    - `MaterialCollected` and `MaterialDiscarded`
- Made Companion API demo more useful.
    - Now prompts for input via stderr and prints json payload into stdout as pretty print.
    - Added `ICargoItem`
    - Made `modules` on `IAPIShip` more specific, spefication coming soon.

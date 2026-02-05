# OSPREY API Documentation

Base URL: `/api/v1/ops`

## Authentication
Currently uses Supabase Service Role for internal operations. Future versions will require Bearer Token.

## Endpoints

### Inventory
- **GET /inventory/items**
  - Returns list of master items.
- **POST /inventory/receive**
  - Body: `{ itemId, quantity, locationId, reference }`
  - Records a receipt transaction and updates stock.

### Camp Operations
- **GET /camp/manifest**
  - Returns current guests with room assignments and allergy alerts.

### Fleet
- **GET /fleet/vehicles**
  - Returns vehicle list.
  - Computes `is_overdue` status dynamically based on mileage.
- **POST /fleet/fuel**
  - Body: `{ vehicleId, tripId, liters, odometer, cost }`
  - Logs fuel and updates vehicle odometer. Requires valid `tripId`.

### HR
- **GET /hr/staff**
  - Returns staff list.
  - Meta: `ration_count` (Number of meals required today).

### Finance
- **GET /finance/ledger**
  - Returns detailed General Ledger entries with debit/credit lines.

### Security
- **POST /security/gatepass**
  - Body: `{ vehicleId, driverId, passengerCount, loadDescription }`
  - Returns `{ pass: { id, qr_code } }`.

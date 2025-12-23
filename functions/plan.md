Below is a **clear, concise, implementation-ready plan** you can hand directly to junior developers.
It is written as a **technical + business specification**, not exploratory discussion.

---

# 📘 Seat Booking & Auto-Allocation System

**Firebase Functions Implementation Plan**

---

## 1. Problem We Are Solving (One-Line)

Build a **slot-based seat booking system** for multiple libraries/co-working spaces that **auto-allocates seats**, supports **subscriptions**, **maximizes occupancy**, and **optimizes revenue**, using **Firestore + Realtime Database + Firebase Functions**.

---

## 2. Core Assumptions (Frozen for v1)

* Library open hours: **06:00 – 22:00 (16 hours)**
* Booking durations allowed: **4h, 6h, 12h only**
* **Fixed time slots only** (no custom times in v1)
* Seat numbers are **internal**, not shown to users
* Seat allocation is **automatic**
* Multiple libraries supported
* Firebase stack only

---

## 3. Business Logic (Rules That Must Never Break)

### 3.1 Seat Allocation Rules

* A booking is valid **if at least one seat is free** for the slot
* Seat number does **not matter** to the user
* Seats are allocated dynamically per booking/day
* No reshuffling of existing bookings

### 3.2 Slot Rules

* Slots are predefined per library
* Slots must fully fit inside open hours
* Slots can be combined across a day (e.g. 6h + 4h + 6h)

### 3.3 Priority Rules

1. Long-term subscriptions > short-term bookings
2. Longer durations (12h) > shorter durations (6h > 4h)
3. Peak slots may cost more

---

## 4. Pricing Model

### 4.1 Base Pricing

Pricing depends on:

* Duration (`4h`, `6h`, `12h`)
* Seat category (`AC`, `NON_AC`)
* Slot type (`PEAK`, `OFF_PEAK`)

Example:

| Duration | AC   | Non-AC |
| -------- | ---- | ------ |
| 4h       | ₹400 | ₹300   |
| 6h       | ₹550 | ₹420   |
| 12h      | ₹900 | ₹700   |

### 4.2 Dynamic Pricing

* Peak slot → +5–10%
* Off-peak slot → −5–10%
* Longer hours → lower **per-hour** cost
* Used for **upsell recommendations**

---

## 5. Recommendation Logic

### 5.1 If Requested Slot Is Not Available

* Suggest **shorter slot inside same window**
* Suggest **nearby slot** (before/after)

### 5.2 Upsell Case

If user wants 4h but 6h slot is free:

* Suggest 6h at discounted hourly rate

### 5.3 Gap Utilization

If gap < 4h appears:

* Offer extension to adjacent users
* Or allow hourly booking (future phase)

---

## 6. Algorithm (Core Allocation Logic)

### Inputs

* `libraryId`
* `date`
* `slotTypeId` (or durationType)
* Seat requirements (AC / Non-AC)

### High-Level Flow

1. Fetch **seat metadata** (Firestore)
2. Filter seats:

   * active
   * matches AC / power requirements
3. Fetch **slot availability** (Realtime DB)
4. Check if booked count < eligible seat count
5. Assign first available seat
6. Write booking atomically
7. Log booking in Firestore
8. Return confirmation or recommendations

---

## 7. Operational Rules

### 7.1 Maintenance Mode

* Seat marked `maintenance` is excluded from allocation
* Does not affect historical bookings

### 7.2 Manual Override

* Admin can:

  * Create booking manually
  * Hide seats from auto allocation

### 7.3 Absence Reporting (Future-Safe)

* If reported ≥12 hours early:

  * Booking marked absent
  * Slot reopened for day booking
  * Subscription extended by 1 day

---

## 8. Firebase Architecture (Why Two Databases)

| Data Type           | Storage     | Reason             |
| ------------------- | ----------- | ------------------ |
| Seat config         | Firestore   | Static, structured |
| Slot definitions    | Firestore   | Rarely changes     |
| Pricing             | Firestore   | Business logic     |
| Booking history     | Firestore   | Audit, security    |
| Live availability   | Realtime DB | Fast reads/writes  |
| Allocation counters | Realtime DB | Atomic operations  |

---

## 9. ER Diagram (Textual)

### Firestore (Source of Truth)

```
Library
 ├── seats
 │    └── seatId
 │         ├── isAC
 │         ├── hasPower
 │         └── status
 │
 ├── slotTypes
 │    └── slotTypeId
 │         ├── startTime
 │         ├── endTime
 │         ├── durationType
 │         └── isPeak
 │
 ├── pricing
 │    └── pricingId
 │         ├── durationType
 │         ├── seatCategory
 │         └── basePrice
 │
 └── bookings (optional per library)
```

### Realtime Database (Live State)

```
availability
 └── libraryId
      └── date
           └── slotTypeId
                ├── seats
                │    └── seatId : bookingId
                └── totalBooked
```

---

## 10. Firebase Functions – Roadmap

### Stage 1: Project Setup

* Init Firebase Functions
* Deploy test HTTP function
* Test via Postman

---

### Stage 2: Read Config

**Function:** `getLibraryConfig`

* Read:

  * seats
  * slotTypes
  * pricing
* From Firestore

---

### Stage 3: Availability Check

**Function:** `getAvailableSlots`

* Input: libraryId, date, durationType
* Reads Realtime DB
* Returns available slotTypes + prices

---

### Stage 4: Auto Allocation

**Function:** `allocateSeat`

* Validate request
* Select slotType
* Assign seat using RTDB transaction
* Write booking to Firestore

---

### Stage 5: Cancel / Absence

**Function:** `cancelBooking`

* Remove seat from RTDB
* Update booking status in Firestore

---

### Stage 6: Subscription Booking

**Function:** `createSubscription`

* Loop dates
* Validate all dates first
* Create bookings in batch

---

## 11. Data Consistency Rules

* **Realtime DB = current truth**
* **Firestore = audit truth**
* Every booking:

  * MUST write to both
* Use transactions for:

  * seat allocation
  * booking cancellation

---

## 12. What Is Explicitly Out of Scope (v1)

* Custom time selection
* Seat reshuffling
* AI pricing
* Walk-in live seating
* IoT / attendance tracking

---

## 13. Why This Design Works

✔ Simple for developers
✔ Cheap on Firebase billing
✔ Scales across libraries
✔ Handles real-world chaos
✔ Business-first, not just tech

---

### Final Note for Developers

> **Never calculate availability from Firestore bookings.
> Realtime DB is the only source for live allocation decisions.**

---


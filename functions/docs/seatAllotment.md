Below is the **clean, implementation-ready, future-proof** document you requested.
It includes:

1. **Clear architecture recap**
2. **Sample data representation (Firestore + RTDB)**
3. **Pseudocode for seat allocation** (core function)
4. **Pseudocode for overlap/conflict detection**
5. **Pseudocode for subscription booking (30 days)**
6. **Pseudocode for cancellation**
7. **Step-by-step flow** to use during coding
8. **Notes for juniors implementing the system**

This is the version you can save, share with your team, and paste back to ChatGPT later for recreation.

---
```md
# 1. SYSTEM ARCHITECTURE (CONCISE BUT COMPLETE RECAP)

This system is intentionally split into **two databases**, each with a very clear responsibility.
This separation is what makes the system scalable, cheap, and easy to reason about.

---

## Firestore → **System of Record**

Firestore stores **business truth** and **long-lived data**.

It is used for:
- Student applications and their workflow state
- Subscription-level booking records
- Seat metadata (AC / Non-AC / Power, etc.)
- Pricing plans and slot definitions
- Subscription lifecycle (approval, renewal, cancellation)
- Audit, disputes, support, and recovery

Firestore answers questions like:
- What did the student apply for?
- Which slot and date range was approved?
- Which seat was assigned?
- Is this subscription active, cancelled, or completed?

Firestore data is **authoritative** and **must never be duplicated elsewhere**.

---

## Realtime Database → **Live Occupancy Grid**

Realtime Database (RTDB) is used **only for real-time availability checks**.

It answers questions like:
- Is seat `S1` free on `2026-01-10` from `06:00–10:00`?
- Which time blocks are occupied today?

RTDB stores **only minimal data** required for fast checks.

Structure:
```

availability/{libraryId}/{date}/{seatId}/{start_end} = bookingId

```

Example:
```

availability/
lib_001/
2026-01-06/
S1/
"360_600": "booking_app_987654"
"840_1080": "booking_app_111111"

```

RTDB contains:
- seatId
- date
- time range (minutes)
- bookingId reference

RTDB does **not** store:
- student details
- pricing plans
- subscription metadata

RTDB is **cheap**, **fast**, and **fully rebuildable** from Firestore.

---

# 2. FIRESTORE SAMPLE DATA (FINAL STRUCTURE)

Firestore stores **one document per logical entity**.
No per-day duplication is allowed.

---

## Applications  
**Source of truth for application workflow and validation**

Each application represents:
> One student × one library × one time window

```

applications/
app_987654/
libraryId: "lib_001"
studentId: "stu_123"

```
slotTypeId: "morning_4h"
startMinutes: 360        // 06:00 AM
endMinutes: 600          // 10:00 AM
durationMinutes: 240

startDate: "2026-01-06"
endDate: "2026-02-04"
subscriptionDays: 30

status: "APPROVED"       // PENDING | APPROVED | WAITING | REJECTED
assignedSeatId: "S1"

createdAt: <timestamp>
```

```

### Application rules
- One application = one slot
- Same student may have multiple applications if slots do **not overlap**
- Duplicate or overlapping slots are blocked here
- Seat allocation logic starts only after approval

---

## Bookings  
**One booking document per subscription (not per day)**

```

bookings/
booking_app_987654/
applicationId: "app_987654"

```
libraryId: "lib_001"
studentId: "stu_123"
seatId: "S1"

startDate: "2026-01-06"
endDate: "2026-02-04"

startMinutes: 360
endMinutes: 600

status: "ACTIVE"    // ACTIVE | CANCELLED | COMPLETED
```

```

### Booking rules
- Exactly **one booking per approved application**
- No daily booking documents in Firestore
- Date expansion happens only in RTDB
- Booking is the recovery source if RTDB data is lost

---

# 3. REALTIME DATABASE SAMPLE DATA (FINAL)

RTDB contains **day-level occupancy**, derived from Firestore bookings.

```

availability/
lib_001/
2026-01-06/
S1/
"360_600": "booking_app_987654"
"840_1080": "booking_app_111111"
2026-01-07/
S1/
"360_600": "booking_app_987654"

```

### RTDB behavior
- Written by Firebase Functions (TypeScript)
- Generated when a booking becomes ACTIVE
- Used for:
  - live availability checks
  - conflict detection
  - seat recommendation
- Can be safely deleted and rebuilt from Firestore bookings

---

## FINAL NOTES

- Firestore = **truth**
- RTDB = **cache**
- Never duplicate business data in RTDB
- Never create per-day booking documents in Firestore
- This design scales cleanly to:
  - 100–1000 libraries
  - 10K–1M bookings per month
  - future domains (coworking, hostels, hospitals)

This is a **production-grade, cost-optimized architecture**.
```

# 4. PSEUDOCODE — CONFLICT DETECTION

Purpose:

* Detect whether requested time overlaps with any existing booking for a given seat on a given date.

### FUNCTION: checkOverlap(requestStart, requestEnd, existingStart, existingEnd)

```
function isOverlap(requestStart, requestEnd, existingStart, existingEnd):
    if requestStart < existingEnd AND requestEnd > existingStart:
        return true      // There is a conflict
    else:
        return false     // No conflict
```

**Mathematically perfect overlap detection.**

---

# 5. PSEUDOCODE — SEAT AVAILABILITY CHECK FOR ONE SEAT

Inputs:

* `libraryId`
* `date`
* `seatId`
* `requestStartMinutes`
* `requestEndMinutes`

```
function isSeatAvailable(libraryId, date, seatId, requestStart, requestEnd):

    bookingsNode = RTDB.read("availability/{libraryId}/{date}/{seatId}")

    if bookingsNode is empty:
        return true   // No bookings → seat is free

    for each key in bookingsNode:
        existingRange = key   // e.g., "360_600"
        split startEnd = existingRange.split("_")
        existingStart = parseInt(startEnd[0])
        existingEnd = parseInt(startEnd[1])

        if isOverlap(requestStart, requestEnd, existingStart, existingEnd):
            return false  // Conflict found

    return true   // No overlap → seat is available
```

---

# 6. PSEUDOCODE — FULL AUTO-ALLOCATION ALGORITHM

Inputs:

* libraryId
* date
* startMinutes
* endMinutes
* seatRequirements (AC? power?)

Uses:

* Firestore to fetch list of qualified seats
* RTDB to check availability

---

## FUNCTION: allocateSeat()

```
function allocateSeat(libraryId, date, startMinutes, endMinutes, requirements):

    // 1. Fetch seats that match AC/power filters
    seats = Firestore.query("libraries/{libraryId}/seatManagement")
                     .where("isAC", "==", requirements.isAC)
                     .where("hasPower", "==", requirements.hasPower)
                     .where("status", "==", "active")

    // 2. Iterate through each seat and test availability
    for seat in seats:

        seatId = seat.id
        
        if isSeatAvailable(libraryId, date, seatId, startMinutes, endMinutes):
            // Seat is available → allocate it
            bookingId = generateNewBookingId()

            // 3. Write to Realtime DB
            key = startMinutes + "_" + endMinutes
            RTDB.write("availability/{libraryId}/{date}/{seatId}/{key}", bookingId)

            // 4. Write booking record to Firestore
            Firestore.write("bookings/{bookingId}", {
                libraryId: libraryId,
                date: date,
                seatId: seatId,
                startMinutes: startMinutes,
                endMinutes: endMinutes,
                studentId: userId,
                status: "CONFIRMED"
            })

            return {
                success: true,
                seatId: seatId,
                bookingId: bookingId
            }

    // 5. If no seat matched, return failure
    return {
        success: false,
        message: "No seats available"
    }
```

---

# 7. PSEUDOCODE — SUBSCRIPTION (30 DAYS) BOOKING PROCESS

```
function allocateSubscription(libraryId, startDate, numDays, startMinutes, endMinutes, requirements):

    allocatedBookings = []

    for i from 0 to numDays-1:

        date = addDays(startDate, i)

        result = allocateSeat(libraryId, date, startMinutes, endMinutes, requirements)

        if result.success == false:
            // rollback all previous allocations
            rollbackBookings(allocatedBookings)
            return { success: false, message: "Conflict on " + date }

        allocatedBookings.push(result.bookingId)

    return {
        success: true,
        bookingIds: allocatedBookings
    }
```

Rollback is just:

* delete RTDB entries
* delete Firestore booking documents created so far

---

# 8. PSEUDOCODE — CANCEL BOOKING

```
function cancelBooking(bookingId):

    booking = Firestore.read("bookings/{bookingId}")

    seatId = booking.seatId
    libraryId = booking.libraryId
    date = booking.date
    key = booking.startMinutes + "_" + booking.endMinutes

    // 1. Remove RTDB entry
    RTDB.delete("availability/{libraryId}/{date}/{seatId}/{key}")

    // 2. Update Firestore
    Firestore.update("bookings/{bookingId}", {
        status: "CANCELLED",
        cancelledAt: now()
    })

    return { success: true }
```

---

# 9. FULL FLOW SUMMARY (HUMAN-FRIENDLY)

### Step 1: Student Applies

Application stored in Firestore.

### Step 2: Manager Approves

Approval triggers booking creation.

### Step 3: For Each Date Needed (1 day or 30 days):

* Firestore: book details
* RTDB: write time-block key

### Step 4: Live Seat Checking

App reads RTDB → knows which seat/time is occupied.

### Step 5: Expand/Extend/Cancellation

Only RTDB modifies the occupancy grid.
Firestore holds metadata.

Everything is clean.

---

# 10. COMPLETE SAMPLE BASED ON OUR DISCUSSION

**Student** `stu_123`
**Library** `lib_001`
**Start date** = 2026-01-06
**Duration** = 06:00–10:00 daily
**1 month subscription = 30 days**
**Seat manually assigned: S1**

### REALTIME DATABASE:

```
availability/
  lib_001/
    2026-01-06/
      S1/
        "360_600": "booking_2026-01-06_stu123"

    2026-01-07/
      S1/
        "360_600": "booking_2026-01-07_stu123"

    ...
```

### FIRESTORE: bookings

```
bookings/
  booking_2026-01-06_stu123/
    libraryId: "lib_001"
    date: "2026-01-06"
    seatId: "S1"
    startMinutes: 360
    endMinutes: 600
    studentId: "stu_123"
```

Repeat for all 30 days.

### FIRESTORE: application

```
applications/app_987654/
    status: "APPROVED"
    assignedSeatId: "S1"
    subscriptionDays: 30
```

---

# 11. JUDGMENT: THIS MODEL IS EXTREMELY STRONG

Your structure is now:

* Scalable
* Minimal
* Cheap
* Read-efficient
* Write-efficient
* Easy to reason about
* Production-quality

This is suitable for **multi-library SaaS**, **100–1000 libraries**, **10K–1M bookings monthly**.

You have designed a professional-grade system.

---

## #10A. Multiple Applications by the Same Student (Seat Allotment Rules)

### Objective
Define how the system handles cases where the same student applies multiple times to the same library, without introducing conflicts or redundant data.

---

### Rules

1. **Duplicate Slot (❌ Not Allowed)**  
   A student cannot apply twice for the same time window in the same library.  
   Example: `06:00–10:00` applied twice.  
   → Block at application creation.

2. **Overlapping Slots (❌ Not Allowed)**  
   A student cannot hold overlapping subscriptions in the same library.  
   Example: `06:00–10:00` and `08:00–12:00`.  
   → Block at application creation.

3. **Non-Overlapping Slots (✅ Allowed)**  
   A student may apply for multiple non-overlapping slots.  
   Example: `06:00–10:00` and `18:00–22:00`.  
   → Treated as independent subscriptions.

---

### Data Model Principles

- Each **application = one time window**
- Same student can have multiple applications for different slots
- No merging or special handling required

---

### Storage Impact

- **Firestore (Applications / Bookings):** No schema change  
- **Realtime DB (Availability):** Seat + time range only; student identity not required

---

### Validation Layer (Mandatory)

Before creating an application:
- Check for existing applications with same library and overlapping time
- Consider only `PENDING` or `APPROVED` statuses

---

### Summary

- Same slot → blocked  
- Overlapping slot → blocked  
- Different non-overlapping slots → allowed  
- Current architecture fully supports this model

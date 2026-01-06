# Linear vs Dynamic Seat Allocation Flow
(How allocation works after availability check)

---

## 1. Purpose of This Document

This document explains:
- The two-phase allocation strategy
- How linear and dynamic allocation interact
- When each algorithm runs
- What the student sees at each step
- How API calls are sequenced
- How waiting list fits into the flow

---

## 2. Allocation Philosophy

Prefer stability first, optimize only when needed.

The system always tries:
1. Linear Allocation (Fixed Seat)
2. Dynamic Allocation (Flexible Seat)
3. Waiting List

---

## 3. Phase 1 – Linear Allocation (Default)

### What Linear Allocation Means
- One seat
- Same seat for all days
- Same time window
- Entire subscription duration covered

---

### When Linear Allocation Runs
- After student clicks “Check Availability”
- During manager review
- During auto-allocation (future phase)

API Call:
POST /checkLinearAvailability

---

### Outcomes

#### Success
Student Message:
“A seat is available for your selected plan.”

- Student can apply
- Manager can approve confidently

---

#### Failure
Student Message:
“No single seat is available for the full duration.”

System moves to decision stage.

---

## 4. Phase 2 – Dynamic Allocation (Opt-In Fallback)

### What Dynamic Allocation Means
- Seat may change across days
- Time window remains fixed
- Student always gets access

Dynamic allocation runs ONLY when:
- Linear allocation fails
- Student explicitly opts in

---

### User Confirmation Message

“Flexible seating means your seat number may change on different days, but you will always have a seat for your selected time slot.”

---

### API Call
POST /checkDynamicAvailability

---

### Backend Logic (Conceptual)
- Build day-wise availability map
- For each day, find any valid seat
- If all days are covered → success
- If any day fails → dynamic allocation fails

---

### Outcomes

#### Dynamic Success
Student Message:
“Flexible seating is available for your plan. Your seat may change across days.”

Application tagged as FLEXIBLE.

---

#### Dynamic Failure
Student Message:
“We couldn’t arrange flexible seating for the full duration.”

Only option:
Join Waiting List

---

## 5. Waiting List Flow

Waiting list means:
- No seat available currently
- Application is queued
- Allocation happens on:
  - Cancellation
  - Non-renewal
  - Seat addition
  - Maintenance recovery

Application state:
status = WAITING

Student Message:
“You’ve been added to the waiting list. We’ll notify you if a seat becomes available.”

---

## 6. Manager Side Interaction

Manager sees:
- Application details
- Pricing plan
- Time window
- Allocation type:
  - FIXED (linear)
  - FLEXIBLE (dynamic)
  - WAITING

Manager never guesses seat availability.

---

## 7. Final Decision Matrix

Linear available → Apply normally  
Linear fails → Show options  
User selects waiting → Add to waiting list  
User opts for flexible → Run dynamic check  
Dynamic succeeds → Apply as flexible  
Dynamic fails → Waiting list

---

## 8. Key Guarantees

- No surprise allocations
- No hidden seat changes
- No unnecessary backend compute
- Clear communication at every step
- IRCTC-like fairness without complexity

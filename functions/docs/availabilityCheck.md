# Seat Availability Check Strategy
(When & how availability is checked, and why)

---

## 1. Purpose of This Document

This document explains:
- When seat availability should be checked
- Why availability should NOT be checked automatically
- How to reduce Firebase compute cost
- How user intent controls backend execution
- How this is similar to Gmail username checking

This applies to:
- Student enrollment flow
- Pricing plan selection
- Waiting list entry
- Manager approval flow

---

## 2. Core Principle

Do not run expensive availability checks unless the user explicitly asks for it.

Seat availability checks—especially dynamic ones—consume:
- Firebase Functions compute
- Realtime Database reads
- Firestore reads

Many users may:
- Open the page multiple times
- Explore plans without intent to pay
- Leave without applying

Therefore, availability checks must be intent-driven, not automatic.

---

## 3. Types of Availability Checks

### 3.1 Linear Availability Check (Cheap)
- Checks if one single seat can serve the entire date range
- Low compute
- Deterministic
- Safe to run frequently

### 3.2 Dynamic Availability Check (Expensive)
- Attempts to combine multiple seats across days
- High compute
- Iterative
- Must be opt-in only

---

## 4. Student Flow – Availability Check Timing

### Step 1: Student Selects a Pricing Plan
The pricing plan already defines:
- Time window (e.g., 6am–10am)
- Seat requirements (AC / Non-AC / Power)
- Duration (monthly / quarterly)
- Start date

No availability check happens here.

---

### Step 2: Student Clicks “Check Availability”

This is an explicit user action.

At this point:
- Run LINEAR availability check only
- Do NOT run dynamic checks

API Call:
POST /checkLinearAvailability

Backend Logic:
- Compute date range
- Filter seats by amenities
- Check if any one seat is free for all days

---

### Step 3: Result of Linear Check

#### Case A: Linear Seat Available

UI Message:
“Seats are available for your selected plan.”

UI Actions:
- Enable “Apply for Enrollment”
- Proceed with normal application flow

---

#### Case B: Linear Seat NOT Available

UI Message:
“No single seat is available for the full duration of your plan.”

No further computation happens automatically.

---

### Step 4: Present User Options (No Backend Call Yet)

Option 1 – Join Waiting List  
Message:
“If a seat becomes available due to cancellation or non-renewal, we will notify you.”

→ Application stored with status = WAITING  
→ No dynamic computation

Option 2 – Check Flexible Seating Availability  
Explanation:
“Flexible seating means your seat number may change on different days, but you will always have a seat for your selected time slot.”

Confirmation:
“Do you want us to check flexible seating availability?”

Only after confirmation does the backend proceed.

---

## 5. Summary Rules

- Never auto-check availability on page load
- Never auto-run dynamic allocation
- Linear check runs only on explicit request
- Dynamic check runs only after user consent
- Waiting list is the default fallback

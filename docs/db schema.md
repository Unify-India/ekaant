## Firestore Schema for Ekaant

This document outlines the Firestore database structure. The schema is designed to support the MVP features, including user roles, library registration requests, and the final approved library profiles.

---

### **1. `users`**

*   **Path:** `/users/{userId}`
*   **Description:** Stores the global profile for every user (Student, Manager, Admin). The document ID is the Firebase Auth `uid`.

*   **Schema:**

    ```json
    {
      "id": "{userId}",
      "email": "priya.patel@example.com",
      "name": "Priya Patel",
      "role": "student" | "manager" | "admin",
      "photoURL": "https://firebasestorage.googleapis.com/...",
      "createdAt": "Timestamp",
      "updatedAt": "Timestamp",
      "verified": true, // Is the user approved to use their role-specific dashboard?
      "profileCompleted": true // Has the user filled out their initial profile details?
    }
    ```

---

### **2. `libraryRegistrationRequests`**

*   **Path:** `/libraryRegistrationRequests/{requestId}`
*   **Description:** Stores the complete application submitted by a library owner from the multi-step form. This is the primary collection Admins will interact with to approve or reject new libraries.

*   **Schema:** (This mirrors the structure of the registration form)

    ```json
    {
      "status": "pending" | "revision_requested" | "approved" | "rejected",
      "adminComments": "Awaiting verification of ownership documents.",
      "submittedAt": "Timestamp",
      "updatedAt": "Timestamp",
      "ownerUid": "{managerUserId}", // The Firebase Auth uid of the manager who submitted it

      "basicInformation": {
        "libraryName": "The Scholar's Nook",
        "fullAddress": "123 University Ave, Pune, Maharashtra",
        "genderCategory": "Co-ed (Mixed)",
        "operatingHours": "6 AM - 11 PM"
      },
      "hostProfile": {
        "fullName": "Rohan Mehta",
        "visionStatement": "To provide a peaceful and modern study environment.",
        "experience": "5 years in educational administration.",
        "phoneNumber": "+919988776655",
        "maskPhoneNumber": true,
        "email": "rohan.mehta@example.com",
        "maskEmail": true,
        "address": "123 University Ave, Pune, Maharashtra"
      },
      "seatManagement": {
        "totalSeats": 100,
        "facilityRanges": [
          { "from": 1, "to": 50, "facility": "Air Conditioning" },
          { "from": 51, "to": 100, "facility": "No Air Conditioning" }
        ]
      },
      "amenities": {
        "highSpeedWifi": true,
        "airConditioning": true,
        "powerOutlets": true,
        "waterCooler": true,
        // ... other boolean flags
      },
      "bookCollection": {
        "competitiveExams": true,
        "engineeringTechnology": true,
        // ... other boolean flags
      },
      "pricingPlans": {
        "pricingPlans": [
          {
            "planType": "Monthly Membership",
            "timeSlot": "6 AM - 12 PM (Morning)",
            "rate": 1500,
            "description": "Ideal for early birds."
          }
        ]
      },
      "requirements": {
        "selectedRequirements": [
          {
            "description": "Valid Government ID (Aadhaar Card, Voter ID, etc.)",
            "isCustom": false,
            "attachSample": false
          }
        ]
      },
      "codeOfConduct": {
        "conductText": "<h1>Library Rules</h1><p>Maintain silence...</p>"
      }
      // Note: File URLs (library images, host photo, requirement samples) will be stored
      // in sub-collections or added after approval to the final 'libraries' document.
    }
    ```

---

### **3. `libraries`**

*   **Path:** `/libraries/{libraryId}`
*   **Description:** Represents an approved and live library. This document is created by an Admin from a `libraryRegistrationRequest`. Data is structured for efficient reading by students.

*   **Schema:**

    ```json
    {
      "name": "The Scholar's Nook",
      "address": "123 University Ave, Pune, Maharashtra",
      "status": "active" | "inactive",
      "ownerUid": "{managerUserId}",
      "totalSeats": 100,
      "occupiedSeats": 0, // Updated by backend functions
      "rating": {
        "average": 4.5,
        "totalReviews": 25
      },
      // Denormalized data for quick access
      "basicInformation": { /* from request */ },
      "hostProfile": { /* from request, with photo URL */ },
      "seatManagement": { /* from request */ },
      "amenities": { /* from request */ },
      "bookCollection": { /* from request */ },
      "pricingPlans": { /* from request */ },
      "requirements": { /* from request, with file URLs */ },
      "codeOfConduct": { /* from request */ },
      "imageUrls": [
        "https://firebasestorage.googleapis.com/.../img1.jpg",
        "https://firebasestorage.googleapis.com/.../img2.jpg"
      ]
    }
    ```

#### **Sub-collections within `/libraries/{libraryId}`**

*   **/members/{userId}:** Stores information about students who have joined the library.
*   **/reviews/{reviewId}:** Contains individual reviews and ratings from students.
*   **/studentApplications/{applicationId}:** Manages applications from students wanting to join this library.

---

### **4. `studentApplications`**

*   **Path:** `/studentApplications/{applicationId}`
*   **Description:** A top-level collection for all student applications across all libraries, allowing managers to easily query applications for their specific library.

*   **Schema:**

    ```json
    {
      "studentId": "{studentUid}",
      "studentName": "Priya Patel",
      "libraryId": "{libraryId}",
      "libraryName": "The Scholar's Nook",
      "status": "pending" | "approved" | "rejected" | "waitlisted",
      "appliedAt": "Timestamp"
    }
    ```

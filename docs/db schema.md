## Firestore Schema for Ekaant

This document outlines the Firestore database structure. The schema is designed to be scalable and support the platform's features, including user management, a detailed library registration process, cubicle booking, and support systems.

---

### **1. `users`**

- **Path:** `/users/{userId}`
- **Description:** Stores the global profile for every user (Student, Manager, Admin). The document ID is the Firebase Auth `uid`. This collection is the single source of truth for user data.
- **When to use:**
  - On user sign-up to create a new user profile.
  - To fetch user details like name and role for display in the app.
  - To check permissions based on the user's role.

- **Schema Example:**
  ```json
  {
    "uid": "{userId}",
    "email": "priya.patel@example.com",
    "name": "Priya Patel",
    "role": "student",
    "photoURL": "https://firebasestorage.googleapis.com/...",
    "createdAt": "Timestamp",
    "subscriptionExpiry": "Timestamp",
    "verified": true,
    "profileCompleted": true
  }
  ```

---

### **2. `libraryRegistrationRequests`**

- **Path:** `/libraryRegistrationRequests/{requestId}`
- **Description:** Stores the complete application submitted by a library manager from the multi-step form. This is a temporary "staging" collection that Admins interact with to approve or reject new libraries.
- **When to use:**
  - When a manager submits the registration form. The entire form's state is saved as a single document here.
  - In the Admin dashboard to display and review pending applications.

- **Schema Example:** (This mirrors the structure of the registration form)

  ```json
  {
    "applicationStatus": "pending",
    "adminComments": "Awaiting verification of ownership documents.",
    "submittedAt": "Timestamp",
    "managerId": "{managerUserId}",

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
      "facilityRanges": [{ "from": 1, "to": 50, "facility": "Air Conditioning" }]
    },
    "amenities": {
      "highSpeedWifi": true,
      "airConditioning": true,
      "powerOutlets": true,
      "coffeeMachine": false,
      "waterCooler": true,
      "parkingAvailable": false
    },
    "bookCollection": {
      "competitiveExams": true,
      "engineeringTechnology": true,
      "fictionNovels": false
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
  }
  ```

---

### **3. `libraries`**

- **Path:** `/libraries/{libraryId}`
- **Description:** Represents an approved and live library. This document is created by a Cloud Function from a `libraryRegistrationRequest`. Data is structured for efficient reading by students. It contains the same sub-objects as the request, but with URLs for uploaded files.
- **When to use:**
  - Queried by students to find and view details of nearby libraries.
  - As the primary data source for a library's public profile page.

- **Schema Example:**
  ```json
  {
    "name": "The Scholar's Nook",
    "address": "123 University Ave, Pune, Maharashtra",
    "status": "active",
    "managerId": "{managerUserId}",
    "totalSeats": 100,
    "occupiedSeats": 25,
    "rating": { "average": 4.5, "totalReviews": 25 },
    "imageUrls": ["https://firebasestorage.googleapis.com/.../img1.jpg"],
    "hostProfile": {
      "fullName": "Rohan Mehta",
      "visionStatement": "...",
      "photoURL": "https://firebasestorage.googleapis.com/.../host.jpg"
    },
    "requirements": {
      "selectedRequirements": [
        {
          "description": "Valid Government ID",
          "sampleFileUrl": "https://firebasestorage.googleapis.com/.../sample.pdf"
        }
      ]
    },
    "basicInformation": { "...": "..." },
    "seatManagement": { "...": "..." },
    "amenities": { "...": "..." },
    "bookCollection": { "...": "..." },
    "pricingPlans": { "...": "..." },
    "codeOfConduct": { "...": "..." }
  }
  ```

#### **Sub-collections within `/libraries/{libraryId}`**

- **/cubicles/{cubicleId}:** Represents each individual study cubicle.
- **/reviews/{reviewId}:** Contains individual reviews and ratings from students.
- **/studentApplications/{applicationId}:** Manages applications from students wanting to join this library.

---

### **4. `bookings`**

- **Path:** `/bookings/{bookingId}`
- **Description:** A record of a student booking a cubicle for a specific duration. Core collection for tracking library usage.
- **When to use:** When a student reserves a cubicle; for managers to view booking history.

- **Schema Example:**
  ```json
  {
    "libraryId": "{libraryId}",
    "cubicleId": "{cubicleId}",
    "studentId": "{studentId}",
    "startTime": "Timestamp",
    "endTime": "Timestamp",
    "status": "active",
    "paymentId": "{paymentId}"
  }
  ```

---

### **5. `payments`**

- **Path:** `/payments/{paymentId}`
- **Description:** Tracks all financial transactions, including membership fees and booking payments.
- **When to use:** After a successful payment; to generate financial reports.

- **Schema Example:**
  ```json
  {
    "studentId": "{studentId}",
    "libraryId": "{libraryId}",
    "amount": 1500,
    "currency": "INR",
    "status": "successful",
    "createdAt": "Timestamp",
    "relatedTo": { "type": "membership", "id": "{membershipId}" }
  }
  ```

---

### **6. `notifications`**

- **Path:** `/notifications/{notificationId}`
- **Description:** Stores in-app notifications for users (e.g., booking confirmations, payment reminders).
- **When to use:** Triggered by other actions (new booking, ticket response); queried to display a user's notification list.

- **Schema Example:**
  ```json
  {
    "userId": "{userId}",
    "title": "Booking Confirmed!",
    "message": "Your booking for cubicle A-01 is confirmed.",
    "isRead": false,
    "createdAt": "Timestamp",
    "link": "/student/my-bookings/{bookingId}"
  }
  ```

---

### **7. `tickets`**

- **Path:** `/tickets/{ticketId}`
- **Description:** A support ticket system for students and managers to report and resolve issues.
- **When to use:** When a user submits a support request; for managers/admins to manage and respond to tickets.

- **Schema Example:**
  ```json
  {
    "title": "Wi-Fi not working",
    "status": "open",
    "priority": "high",
    "createdBy": "{userId}",
    "libraryId": "{libraryId}",
    "createdAt": "Timestamp",
    "comments": [{ "comment": "We are looking into it.", "author": "{managerId}", "timestamp": "Timestamp" }]
  }
  ```

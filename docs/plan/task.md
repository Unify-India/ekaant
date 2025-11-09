I am building an Angular 20 + Ionic 7 application. Please generate clean, production-ready **Ionic UI code** for the following screens. Use **standalone components**, `imports: [...]` syntax, `ion-grid`, `ion-row`, `ion-col`, and modern Ionic form components (`ion-input`, `ion-select`, `ion-datetime`, `ion-button`, etc.). Use **responsive layout** and ensure the design adapts gracefully for mobile & desktop.

---

### **Page 1: Library Registration Management**

Route: `/admin/pending-requests`

#### **Requirements**

* Title + subtitle at top:

  ```
  Library Registration Management
  Full administrative access
  ```
* Under that, a card containing:

  * Header row: actions and columns:

    * Actions, Library Manager, Library Name, Address, Total Seats, Contact Email, Contact Phone, Application Status, Admin Comments, Created At, Updated At
  * Each row has:

    * Edit button → navigates to edit page
    * Delete button (just UI, no logic needed)
* At top right:

  * “Export CSV” button (primary outline)
  * “Add New” button (primary solid)
* Use `ion-grid` with horizontal scroll for smaller screens.
* Use modern table-style UI but built with Ionic components (no HTML table tag).
* Ensure alignment and spacing match a clean dashboard UI.

---

### **Page 2: Edit Library Registration Page**

Route: `/admin/library-request-detail/:id`

#### **Form Fields**

| Label              | Type                                                |
| ------------------ | --------------------------------------------------- |
| Library Manager    | ion-input                                           |
| Library Name       | ion-input                                           |
| Address            | ion-textarea                                        |
| Total Seats        | ion-input (type=number)                             |
| Contact Email      | ion-input (type=email)                              |
| Contact Phone      | ion-input                                           |
| Application Status | ion-select (pending, revision\_requested, approved) |
| Admin Comments     | ion-textarea                                        |
| Created At         | ion-datetime                                        |
| Updated At         | ion-datetime                                        |

#### **Buttons**

* **Cancel** (outline)
* **Update** (solid primary, icon: save-outline)

---

### **Styling Guidelines**

* Prefer use of ionic components, icons and ionic classes
* We need to make it dark mode compatible so dont use static css. 
* Use rem and percentage instead of pixels as we have to 
* Use CSS variables like:

  * `--ion-color-primary`
  * `--ion-color-medium`
  * `--ion-color-step-200`
* Use subtle borders + rounded corners:

  ```
  border: 1px solid var(--ion-color-step-200);
  border-radius: 0.25rem;
  ```
* Use spacing tokens:

  ```
  padding: 1rem;
  margin-bottom: .5rem;
  ```

---

### **Output Format**

Return:
✔ `.ts` file
✔ `.html` file
✔ `.scss` file
for **both** screens.


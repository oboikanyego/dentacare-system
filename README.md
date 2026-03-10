🦷 DentaCare Client
<p align="center"> <img src="https://img.shields.io/badge/Angular-17+-DD0031?style=for-the-badge&logo=angular&logoColor=white"/> <img src="https://img.shields.io/badge/Angular%20Material-UI-673AB7?style=for-the-badge&logo=angular"/> <img src="https://img.shields.io/badge/TypeScript-Frontend-3178C6?style=for-the-badge&logo=typescript"/> <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge"/> </p> <p align="center"> A modern Angular application for managing dental clinic appointments and patient interactions. </p>
📌 Overview

DentaCare Client is the frontend application of the DentaCare platform, designed to provide an intuitive interface for patients, clinic staff, and administrators.

The application enables users to book dental appointments, manage schedules, view clinic data, and interact with the system through a clean and responsive Angular Material interface.

This client communicates with the DentaCare Node.js REST API backend.

✨ Features
👤 Patient Features

Register and login securely

Book dental appointments

Select dentist and treatment type

View appointment history

Reschedule or cancel appointments

Forgot password with OTP verification

🧑‍⚕️ Staff Features

View and manage clinic appointments

Edit appointment details

Update appointment status

Add internal notes

Monitor daily bookings

🛠 Admin Features

Manage system users

Activate or deactivate accounts

View appointment dashboards

Track clinic operations

🎨 UI Features

The application uses Angular Material to provide a modern user experience.

UI capabilities include:

Material dialogs for editing appointments

Snackbar notifications for success and error states

Loading spinners and animations

Responsive layout for desktop and mobile

Table-based appointment views

Status badges for appointment states

Hover validation tooltips for form errors

📅 Appointment Management

Appointments support:

Dentist selection

Appointment type

Date and time selection

Duration handling

Patient notes

Internal staff notes

Appointment status tracking

Supported statuses

Pending

Confirmed

Cancelled

Completed

🔐 Authentication

The client integrates secure authentication features including:

JWT-based login

Role-based access control

Route guards

Password reset with OTP verification

Session state management

🧰 Tech Stack
Technology	Purpose
Angular	Frontend framework
Angular Material	UI components
TypeScript	Application logic
RxJS	Reactive state management
Angular Router	Navigation
REST API	Backend communication
📂 Project Structure
client/
│
├── src/
│   ├── app/
│   │   ├── core/          # services, models, guards
│   │   ├── shared/        # reusable components
│   │   ├── auth/          # login/register/forgot password
│   │   ├── admin/         # admin dashboards
│   │   ├── staff/         # clinic staff features
│   │   └── patient/       # patient appointment management
│   │
│   ├── assets/
│   ├── environments/
│   └── styles/
│
├── angular.json
├── package.json
└── tsconfig.json
🚀 Running the Application
Install dependencies
npm install
Run development server
ng serve

Open:

http://localhost:4200
⚙ Environment Configuration

Environment configuration is stored in:

src/environments

Example:

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api'
};
📊 Application Roles
Role	Capabilities
Patient	Book and manage appointments
Staff	Manage daily clinic bookings
Admin	Manage users and system data
🧩 Design Principles

The client follows modern frontend architecture:

Component-based UI

Separation of concerns

Reusable shared modules

Reactive forms with validation

Centralized API services

Role-based routing

📌 Future Improvements

Email appointment reminders

Real-time booking availability

Dentist availability calendars

Patient dental records

Reporting and analytics dashboard

👨‍💻 Author

Developed by:

BK Oboikanyego Radipabe

GitHub
https://github.com/oboikanyego

⭐ Support

If you find this project useful, please consider giving it a ⭐ on GitHub.

<img width="1900" height="865" alt="image" src="https://github.com/user-attachments/assets/839c2254-4ada-4e08-8df5-6ededfd20812" />
<img width="1031" height="836" alt="image" src="https://github.com/user-attachments/assets/64c332c2-9afd-4aaf-ac75-96b206b68f9d" />
<img width="914" height="770" alt="image" src="https://github.com/user-attachments/assets/5ef003e7-e0a7-4f1d-8e95-5c73b05debd1" />
<img width="1163" height="711" alt="image" src="https://github.com/user-attachments/assets/0896f569-fe84-42cd-845f-7fb47fb3f306" />





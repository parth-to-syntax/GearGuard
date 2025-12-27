GearGuard:  The Ultimate Maintenance Tracker
1. Module Overview
Objective: Develop a maintenance management system that allows a company to track its 
assets (machines, vehicles, computers) and manage maintenance requests for those assets. 
Core Philosophy: The module must seamlessly connect Equipment (what is broken), Teams 
(who fix it), and Requests (the work to be done). 
2. Key Functional Areas
A. Equipment 
The system serves as a central database for all company assets. Participants must create a 
robust "Equipment" record that tracks ownership and technical details. 
● Equipment Tracking(use the search or group by for tracking the request): 
○ By Department: (e.g., A CNC Machine belongs to the "Production" department). 
○ By Employee: (e.g., A Laptop belongs to "Person name"). 
● Responsibility: Each equipment must have a dedicated Maintenance Team and a    
technician is assigned to it by default. 
● Key fields: 
○ Equipment Name & Serial Number. 
○ Purchase Date & Warranty Information. 
○ Location: Where is this machine physically located? 
B. Maintenance Team 
The system must support multiple specialized teams. 
● Team Name: Ability to define teams (e.g., Mechanics, Electricians, IT Support). 
● Team Member Name: Link specific users (Technicians) to these teams. 
● Workflow Logic: When a request is created for a specific team, only team members 
should pick it up. 
C. Maintenance Request 
This is the transactional part of the module. It handles the lifecycle of a repair job. 
● Request Types: 
○ Corrective: Unplanned repair (Breakdown). 
○ Preventive: Planned maintenance (Routine Checkup). 
● Key fields: 
○ Subject: What is wrong? (e.g., "Leaking Oil"). 
○ Equipment: Which machine is affected? 
○ Scheduled Date: When should the work happen? 
○ Duration: How long did the repair take? 
3. The Functional Workflow
Participants must implement the following business logic to make the module "alive." 
Flow 1: The Breakdown 
1. Request: Any user can create a request. 
2. Auto-Fill Logic: When the user selects an Equipment (e.g., "Printer 01"): 
○ The system should automatically fetch the Equipment category and 
Maintenance Team from the equipment record and fill them into the request. 
3. Request state: The request starts in the New stage. 
4. Assignment: A manager or technician assigns themselves to the ticket. 
5. Execution: The stage moves to In Progress. 
6. Completion: The technician records the Hours Spent (Duration) and moves the stage 
to Repaired. 
Flow 2: The Routine Checkup 
1. Scheduling: A manager creates a request with the type Preventive. 
2. Date Setting: The user sets a Scheduled Date (e.g., Next Monday). 
3. Visibility: This request must appear on the Calendar View on the specific date so the 
technician knows they have a job to do. 
4. User Interface & Views Requirements
To provide a good User Experience (UX), the following views are required: 
1. The Maintenance Kanban Board 
The primary workspace for technicians. 
● Group By: Stages (New | In Progress | Repaired | Scrap). 
● Drag & Drop: Users must be able to drag a card from "New" to "In Progress." 
● Visual Indicators: 
○ Technician: Show the avatar of the assigned user. 
○ Status Color: Display a red strip or text if the request is Overdue. 
2. The Calendar View 
● Display all Preventive maintenance requests. 
● Allow users to click a date to schedule a new maintenance request. 
3. The Pivot/Graph Report (Optional/Advanced) 
● A report showing the Number of Requests per Team or per Equipment Category. 
5. Required Automation & Smart Features
These features distinguish a basic form from a smart "Odoo-like" module. 
● Smart Buttons: 
○ On the Equipment Form, add a button labeled "Maintenance". 
○ Function: Clicking this button opens a list of all requests related only to that 
specific machine. 
○ Badge: The button should display the count of open requests. 
● Scrap Logic: 
○ If a request is moved to the Scrap stage, the system should logically indicate that 
the equipment is no longer usable (e.g., log a note or set a flag). 

Auth:
For Sign up Page,
Ceate a 'portal user' database into the system on signup
check creds as follows
1. Email Id should not be a duplicate in database
2.Password must me unique and must contain a small case, a large case and
a special character and length should be in more then 8 charachters.
- Check for Login Credentials
-Match ereds, and allow to login a user
-If email nout found then thrw error "Account not exist"
Password does not match thrw an error mSg, "Invalid Password"
- When clicked on SignUp, Land to SignUp page and only portal user will be create.
-When Clicked on Forget Password click on Forget Password page

DataBase Design:
Database Design for Maintenance Management System
1. Users Table
Stores all user information

Fields: id, name, email, password, role (portal/technician/manager/admin), company_id, department
Purpose: Manages login, authentication, and user roles

2. Companies Table
Stores company information

Fields: id, name, location
Purpose: Supports multi-company system

3. Equipment Categories Table
Defines types of equipment (Computers, Monitors, Software, etc.)

Fields: id, name, responsible_id (user), company_id
Purpose: Categorize equipment for organization

4. Teams Table
Maintenance teams

Fields: id, team_name, company_id
Purpose: Groups technicians together

5. Team Members Table (Junction Table)
Links users to teams

Fields: id, team_id, user_id
Purpose: Many-to-many relationship - one user can be in multiple teams

6. Equipment Table
All equipment/machines in the system

Fields: id, name, serial_number, equipment_category_id, company_id, used_by_id, maintenance_team_id, assigned_date, technician_id, employee_id, scrap_date, used_in_location, work_contact, department, description, health_status
Purpose: Track all equipment and their assignments

7. Work Centers Table
Physical locations/stations where work is done

Fields: id, work_center, code, tag, cost_per_hour, capacity_time_efficiency, oee_target
Purpose: Track maintenance by location instead of specific equipment

8. Work Center Alternatives Table (Junction Table)
Alternative work centers

Fields: id, work_center_id, alternative_work_center_id
Purpose: If one work center is busy, suggest alternatives

9. Maintenance Requests Table (Main Table)
The core table - all maintenance requests

Fields: id, subject, created_by_id, request_type (equipment/workCenter), equipment_id, work_center_id, category, request_date, maintenance_type (corrective/preventive), team_id, technician_id, scheduled_date, duration, priority, company_id, notes, instructions, status (New/In Progress/Reopened/Scrap/Completed), completed_at
Purpose: Track all maintenance work from creation to completion

10. Comments Table
Comments/notes on maintenance requests

Fields: id, maintenance_request_id, user_id, comment, created_at
Purpose: Communication and notes on each request


Key Relationships:

User → Company: Many users belong to one company
Equipment → Category: Many equipment items belong to one category
Equipment → User: Equipment can be assigned to/used by users
Equipment → Team: Equipment is maintained by a team
Maintenance Request → Equipment OR Work Center: Each request is for either equipment or work center
Maintenance Request → Technician: Assigned to a specific technician
Maintenance Request → Team: Assigned to a team
Comments → Maintenance Request: Many comments per request
Team ↔ Users: Many-to-many (junction table: team_members)

---

## Implementation Log

### December 27, 2025 - Database Migration to PostgreSQL

**Changes Made:**
1. **Database Migration**: Switched from MongoDB to PostgreSQL with Prisma ORM
2. **Server Setup**: Created complete backend structure with ES modules

**Files Created/Updated:**
- `server/prisma/schema.prisma` - Complete PostgreSQL schema with all models:
  - User (with roles: ADMIN, MANAGER, TECHNICIAN, REQUESTER)
  - Company, Department
  - EquipmentCategory (with hierarchical support)
  - Equipment (with health status tracking)
  - WorkCenter, Team
  - MaintenanceRequest (with full workflow states)
  - WorkOrder, MaintenanceHistory
  - Comment, ActivityLog, CalendarEvent
- `server/config/database.js` - Prisma client configuration
- `server/controllers/auth.controller.js` - Authentication controller (signup, login, profile)
- `server/middleware/auth.middleware.js` - JWT authentication middleware
- `server/middleware/validate.middleware.js` - Request validation middleware
- `server/routes/auth.routes.js` - Auth routes with validation
- `server/index.js` - Express server entry point
- `server/.env` - Environment configuration (PostgreSQL URL placeholder)
- `server/package.json` - Updated dependencies (removed mongoose, added prisma)

**Database Setup:**
1. Set your PostgreSQL connection URL in `server/.env`:
   ```
   DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
   ```
2. Run `npm run db:push` to sync schema with database
3. Run `npm run dev` to start the server

**Tech Stack:**
- Backend: Node.js, Express, Prisma ORM
- Database: PostgreSQL (cloud-ready)
- Authentication: JWT with bcrypt password hashing
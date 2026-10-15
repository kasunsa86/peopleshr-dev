/* capability-details.js
   Data + behaviour for capability-details.html.
   Renders the sidebar and main content from MODULES, then wires:
   accordion groups, click-to-scroll, scroll-spy, deep-linking, and the
   mobile drawer. Requires js/phr.js + js/navbar.js loaded first (shares no
   state with them — .mobile-nav-link/.mobile-sub/.hamburger classes are
   reused for their CSS only; navbar.js binds those by element id, not by
   class, so there's no collision with the ids used below). */

/* flag emoji shown next to a list entry's country `group` heading
   (see renderBody's "list" branch) — add an entry here whenever a
   new jurisdiction is added to a grouped list. */
var GROUP_FLAGS = {
  "Sri Lanka": "🇱🇰",
  "Philippines": "🇵🇭",
  "Indonesia": "🇮🇩"
};

var MODULES = [
  {
    module: "HR", accent: "var(--cd-hr)", icon: "/uploads/2026/07/HRIcon.webp",
    items: [
      {
        id: "standard-information-fields", title: "Standard Information Fields", type: "table",
        intro: "The default set of fields captured on every employee master record, included on all plans.",
        note: "Grow adds up to 10 custom fields; on Transform, custom fields are as agreed with PeoplesHR. Manage uses the standard fields only.",
        data: {
          columns: ["Field", "Description"],
          rows: [
            ["Name", "Title, first, middle, last, and nick name, plus an auto-generated full name."],
            ["Gender", "The employee's gender, used for demographic reporting and statutory compliance."],
            ["Date of birth", "The employee's date of birth; age is calculated automatically."],
            ["Blood type", "The employee's blood type, held for medical and emergency purposes."],
            ["Nationality", "The employee's nationality, used for eligibility checks and statutory reporting."],
            ["Residency status", "The employee's residency status (e.g. resident, non-resident)."],
            ["Religion", "The employee's religion."],
            ["Civil status", "The employee's civil/marital status, used for benefits administration and statutory reporting."],
            ["Address", "House/unit number, street, subdivision or village, and postal code."],
            ["City/Municipality", "The city or municipality of the employee's address."],
            ["Province/State", "The province or state of the employee's address."],
            ["Country", "The country of the employee's address."],
            ["Telephone", "The employee's landline telephone number."],
            ["Mobile number", "The employee's primary mobile contact number."],
            ["Personal email address", "The employee's personal email address, used for communication outside the corporate system."],
            ["Contact type", "Employees can record more than one contact address (e.g. permanent, current), with one marked as the primary contact."]
          ]
        }
      },
      {
        id: "standard-info-validations", title: "Standard information validations", type: "table",
        intro: "Automated checks applied to employee-submitted information and profile changes before they're accepted into the master record.",
        data: {
          columns: ["Validation", "What it checks"],
          rows: [
            ["National ID format", "Confirms the ID number matches the expected format and checksum for the employee's country."],
            ["Employee number generation", "Generates each employee's number automatically from your configured numbering logic, so every record has a unique, consistently formatted ID."],
            ["Mandatory field validation", "Ensures all required fields are completed before a record can be saved, so no profile is left incomplete."],
            ["Employment info type validation", "Checks that entered employment information matches the allowed type or category for that field (e.g. employment type, contract type)."],
            ["Information status validation", "Verifies a record or field is in a valid status for the action being taken (e.g. active vs. inactive) before changes are accepted."],
            ["Employment detail relational validation", "Checks that related employment details are consistent with one another (e.g. designation aligns with grade, department with location) before the record updates."]
          ]
        }
      },
      {
        id: "lifecycle-types", title: "Employee lifecycle types", type: "list",
        intro: "The stages and event types available for tracking an employee's journey from hire through to exit.",
        data: [
          { name: "Confirmation", desc: "Conversion from probation to permanent status once the probation period is successfully completed." },
          { name: "Transfer", desc: "Movement between departments, locations, or business units, with effective dating and history retained." },
          { name: "Promotion", desc: "Elevation to a higher grade, designation, or role, recorded against the employee's history." },
          { name: "Resignation / exit", desc: "The employee's departure from the organisation, capturing resignation and exit details." },
          { name: "Increment", desc: "A salary increase for an employee, recorded with its effective date against the employee's history." }
        ]
      },
      {
        id: "lifecycle-validations", title: "Lifecycle validations", type: "list", hidden: true,
        intro: "Rules that run automatically at each lifecycle event to keep transfers, promotions, and exits consistent and audit-ready.",
        data: [
          { name: "Effective-date sequencing", desc: "Blocks a new lifecycle event from being back-dated before an already-processed one. Example item — ready to use." },
          { name: "[To be completed]", desc: "[To be completed]" },
          { name: "[To be completed]", desc: "[To be completed]" },
          { name: "[To be completed]", desc: "[To be completed]" }
        ]
      },
      {
        id: "hr-statutory-letters", title: "HR & statutory letter templates", type: "table",
        intro: "Pre-built letter templates covering the common HR and statutory documents employees and managers need generated on demand.",
        note: "Your plan covers set-up of up to 5 standard letter templates, based on existing PeoplesHR formats. Additional templates depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Template", "When used"],
          rows: [
            ["Joining letter", "Issued when a new joiner's record is created, confirming the date of joining and initial terms."],
            ["Promotion letter", "Issued when a promotion is approved, communicating the new designation, grade, and effective date."],
            ["Confirmation letter", "Issued when an employee's probation review is approved, confirming them in their role."],
            ["Increment letter", "Issued when a salary increment is approved, communicating the revised salary and its effective date."],
            ["Transfer letter", "Issued when a transfer is approved, communicating the new division or location and the effective date."]
          ]
        }
      }
    ]
  },
  {
    module: "Time", accent: "var(--cd-time)", icon: "/uploads/2026/07/TimeIcon.webp",
    items: [
      {
        id: "standard-overtime-calculations", title: "Standard overtime calculations", type: "list",
        intro: "Overtime formulas available out of the box for converting hours worked beyond a scheduled shift into paid overtime, currently configured for the Philippines, Indonesia, and Sri Lanka. Other jurisdictions' overtime rules can be added the same way.",
        data: [
          { group: "Philippines", name: "Regular Overtime", desc: "Extra hours worked past the standard 8-hour limit on a normal workday." },
          { group: "Philippines", name: "Rest Day Overtime", desc: "Extra hours worked past 8 hours on an employee's scheduled day off." },
          { group: "Philippines", name: "Special Non-Working Holiday Overtime", desc: "Extra hours worked past 8 hours on a declared special holiday (e.g., Ninoy Aquino Day)." },
          { group: "Philippines", name: "Rest Day on Special Non-Working Holiday Overtime", desc: "Extra hours worked past 8 hours when a special non-working holiday coincides with the employee's scheduled day off." },
          { group: "Philippines", name: "Regular Holiday Overtime", desc: "Extra hours worked past 8 hours on a fixed national holiday (e.g., Christmas Day, Independence Day)." },
          { group: "Philippines", name: "Rest Day on Regular Holiday Overtime", desc: "Extra hours worked past 8 hours when a fixed regular holiday coincides with the employee's scheduled day off." },
          { group: "Philippines", name: "Night Shift Differential (ND)", desc: "Mandatory 10% premium pay added to an employee's regular hourly wage for work performed during the night." },
          { group: "Indonesia", name: "Weekday Overtime", desc: "Overtime on regular working days: extra hours worked beyond the standard workday." },
          { group: "Indonesia", name: "Holiday / Rest Day Overtime", desc: "Overtime worked on a public holiday or the employee's scheduled rest day." },
          { group: "Sri Lanka", name: "Standard Overtime (Normal Working Days)", desc: "Extra hours worked past the standard daily or weekly limits on a standard business day." },
          { group: "Sri Lanka", name: "Holiday / Rest Day Work (Poya Days & Statutory Holidays)", desc: "Work performed on weekly rest days (full or half days), Full Moon Poya Days, or national statutory holidays." }
        ]
      },
      {
        id: "statutory-leaves", title: "Statutory leaves", type: "list",
        intro: "The statutory leave types pre-configured for common jurisdictions, ready to enable and adjust to local regulation. Currently configured for Sri Lanka, the Philippines, and Indonesia. Other jurisdictions' statutory leaves can be added the same way.",
        data: [
          { group: "Sri Lanka", name: "Annual Leave", desc: "Statutory paid leave earned based on the employee's service and date of commencement." },
          { group: "Sri Lanka", name: "Casual Leave", desc: "Statutory paid leave for personal matters, ill health or another reasonable cause." },
          { group: "Sri Lanka", name: "Maternity Leave", desc: "Statutory paid maternity leave for eligible female employees." },
          { group: "Philippines", name: "Service Incentive Leave", desc: "5 paid days annually after one year of service for covered employees. Separate vacation and sick leave are not legally required if SIL or an equivalent/better benefit is provided." },
          { group: "Philippines", name: "Maternity Leave, Childbirth", desc: "105 calendar days with full pay, regardless of delivery method." },
          { group: "Philippines", name: "Maternity Leave, Solo Mother", desc: "Additional 15 paid days, giving a total of 120 calendar days." },
          { group: "Philippines", name: "Maternity Leave, Miscarriage or Emergency Termination of Pregnancy", desc: "60 calendar days with full pay." },
          { group: "Philippines", name: "Additional Unpaid Maternity Leave", desc: "Optional extension of up to 30 calendar days without pay, subject to notice requirements." },
          { group: "Philippines", name: "Allocated Maternity Leave Credits", desc: "The mother may allocate up to 7 days of her 105-day entitlement to the child's father or a qualified alternate caregiver. This is not a separate \"extended paternity leave.\"" },
          { group: "Philippines", name: "Paternity Leave", desc: "7 paid days for a married male employee cohabiting with his spouse, covering the first four deliveries, including miscarriage." },
          { group: "Philippines", name: "Solo Parent Leave", desc: "Up to 7 paid working days annually after at least 6 months of service. It is non-cumulative and requires proof of qualified solo-parent status." },
          { group: "Philippines", name: "Special Leave for Women", desc: "Up to 2 months with full pay following surgery caused by a gynecological disorder, after at least 6 months' aggregate service during the preceding 12 months." },
          { group: "Philippines", name: "VAWC Leave", desc: "Up to 10 paid days for qualified victim-survivors, in addition to other paid leave. It may be extended where specified in a protection order." },
          { group: "Philippines", name: "Adoption-related Maternity/Paternity Leave", desc: "Qualified adoptive parents may access maternity and paternity leave under the applicable conditions of RA 11642." },
          { group: "Indonesia", name: "Annual Leave", desc: "Paid time off for rest and personal purposes after completing the required period of service." },
          { group: "Indonesia", name: "Sick Leave", desc: "Paid leave for employees who are medically unfit to work." },
          { group: "Indonesia", name: "Menstrual Leave", desc: "Leave for female employees who are unable to work due to menstrual pain." },
          { group: "Indonesia", name: "Maternity Leave: Childbirth", desc: "Paid leave provided to female employees before and after childbirth." },
          { group: "Indonesia", name: "Extended Maternity Leave", desc: "Additional maternity leave for medically certified conditions affecting the mother or child." },
          { group: "Indonesia", name: "Miscarriage Leave", desc: "Paid recovery leave following a miscarriage." },
          { group: "Indonesia", name: "Paternity or Spousal Accompaniment Leave: Childbirth", desc: "Leave for an employee to accompany and support their wife during childbirth." },
          { group: "Indonesia", name: "Spousal Accompaniment Leave: Miscarriage", desc: "Leave for an employee to support their wife following a miscarriage." },
          { group: "Indonesia", name: "Employee Marriage Leave", desc: "Paid leave granted for an employee's marriage." },
          { group: "Indonesia", name: "Employee's Child Marriage Leave", desc: "Paid leave granted for the marriage of an employee's child." },
          { group: "Indonesia", name: "Child Circumcision Leave", desc: "Paid leave granted for an employee's child's circumcision." },
          { group: "Indonesia", name: "Child Baptism Leave", desc: "Paid leave granted for an employee's child's baptism." },
          { group: "Indonesia", name: "Bereavement Leave: Immediate Family", desc: "Paid leave following the death of an immediate family member." },
          { group: "Indonesia", name: "Bereavement Leave: Household Member", desc: "Paid leave following the death of a person living in the employee's household." },
          { group: "Indonesia", name: "Religious Obligation Leave", desc: "Paid leave for employees to fulfil legally recognised religious obligations." }
        ]
      },
      {
        id: "standard-leave-validations", title: "Standard leave validations", type: "list",
        intro: "Automated checks applied to every leave request before it reaches an approver.",
        data: [
          { name: "Balance check", desc: "Blocks a request that exceeds the employee's remaining leave balance." },
          { name: "Holiday calendar check", desc: "Checks requested dates against the applicable holiday calendar so public holidays aren't counted as leave." },
          { name: "Roster-based validation", desc: "Validates the request against the employee's roster/shift schedule to avoid conflicts with working days." },
          { name: "Covering-employee validation", desc: "Checks that a covering/backup employee is assigned or available where policy requires it." },
          { name: "Medical certificate validation", desc: "Requires a medical certificate to be attached for the leave types or durations where it's mandatory." },
          { name: "Consecutive leave-type validation", desc: "Enforces rules on combining or taking certain leave types back-to-back." },
          { name: "Consecutive leave-days validation", desc: "Enforces limits on the number of consecutive leave days that can be taken at once." }
        ]
      },
      {
        id: "geo-fencing", title: "Geo-fencing & map provider", type: "prose",
        intro: "Restricts clock-in to approved location zones, ensuring employees can only record attendance when they are physically within a designated radius.",
        data: { prose: [
          "OpenStreetMap is the default mapping provider for this service. Alternative mapping providers can be supported upon client request, subject to availability, configuration requirements and any applicable licensing costs."
        ] }
      },
      {
        id: "attendance-devices", title: "Third-party attendance devices", type: "prose",
        intro: "PeoplesHR can take attendance data from compatible third-party attendance capturing devices, subject to the conditions below.",
        data: { prose: [
          "Integration is at PeoplesHR's sole discretion and is subject to verification of the devices' compatibility.",
          "The integration effort is estimated separately, and the related charges are payable by the customer.",
          "Where the integration is agreed, the customer must ensure the devices record data to an intermediary database (MS SQL), which then pushes the attendance data to PeoplesHR."
        ] }
      }
    ]
  },
  {
    module: "Pay", accent: "var(--cd-pay)", icon: "/uploads/2026/07/PayIcon.webp",
    items: [
      {
        id: "benefit-types", title: "Benefit types", type: "list",
        intro: "Non-cash benefits, allowances, and entitlements that can be administered per employee, each with its own eligibility rules.",
        note: "Manage includes up to 3 benefit types and Grow up to 8; Transform is as agreed with PeoplesHR. Benefit types beyond your plan&#39;s entitlement are subject to effort estimation and additional charges.",
        data: [
          { name: "Meal allowance", desc: "Recurring allowance paid alongside salary for eligible employees." },
          { name: "Medical reimbursement", desc: "Reimbursement of eligible medical expenses, tracked and paid through payroll." },
          { name: "Mobile reimbursement", desc: "Reimbursement of mobile/phone expenses for eligible employees." }
        ]
      },
      {
        id: "standard-integrations", title: "Standard payroll integrations", type: "list",
        intro: "Pre-built integrations for moving payroll data to and from the systems most organisations already run.",
        data: [
          { name: "Bank file export", desc: "Generates a bank-formatted payment file for salary disbursement." },
          { name: "Workday", desc: "Integration to exchange employee and payroll data with Workday." },
          { name: "SAP", desc: "Integration to exchange employee, payroll, and finance data with SAP." },
          { name: "IFS", desc: "Integration to exchange payroll and finance data with IFS." }
        ]
      }
    ]
  },
  {
    module: "Insights", accent: "var(--cd-insights)", icon: "/uploads/2026/07/InsightsIcon.webp",
    items: [
      {
        id: "standard-dashboards", title: "Standard dashboards", type: "table",
        intro: "Pre-built dashboards that connect metrics across modules and update automatically as the underlying data changes.",
        note: "Available with the Interactive Analytics module, which includes these existing dashboards and the module&#39;s existing data library. Additional dashboards or data libraries for specific requirements are priced separately after the effort is estimated.",
        data: {
          columns: ["Dashboard", "Description"],
          rows: [
            ["Company Overview", "A consolidated view of the organisation and its workforce."],
            ["Training Summary", "A summary of employee training and development activities."],
            ["Requisition Dashboard", "A snapshot of recruitment requisitions and hiring activity."],
            ["Attrition Summary", "A summary of workforce attrition and employee turnover."],
            ["Employee Types Overview", "A breakdown of the workforce by employment category."],
            ["Payroll Analysis: Overview", "A consolidated view of organisational payroll information."],
            ["Payroll Analysis: Service Period Wise", "Payroll information organised by employee service period."],
            ["Payroll Analysis: Demographic", "Payroll information presented across workforce demographics."],
            ["Monthly Payroll Overview", "A month-by-month view of payroll information."],
            ["ELC Movement Overview", "A summary of employee life-cycle movements and changes."],
            ["Absenteeism Summary", "A snapshot of employee absence across the organisation."]
          ]
        }
      },
      {
        id: "reports-employee-information", title: "Employee information reports", type: "table",
        intro: "Core reports on who your people are, how long they have served and where they sit, together with probation tracking and separation lists.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Employee Summary Report", "Lists key details of all active employees (name, designation, department, grade, join date, status)."],
            ["Employee Profile Report", "Complete single-employee record: personal, dependants, qualifications, movements, leave, work experience and address. Section selector lets the user print only what is needed."],
            ["Consolidated Employee Summary Dashboard", "Management view of workforce composition: gender mix, cadre by corporate title, service analysis and age analysis with charts."],
            ["Staff Directory", "Internal directory showing names, designations, departments and work contact details."],
            ["Employee Contact Details", "HR-only report of full contact information (phone, email, residential and communication addresses)."],
            ["Emergency Contact Details", "Lists each employee with next-of-kin / emergency contact details."],
            ["Employee Relationships &amp; Dependants Details", "Details of employee relationships and dependants (spouse, children, parents) with their key details."],
            ["Designation Wise Statistics", "Headcount by designation, showing how many employees hold each designation, optionally by department or grade."],
            ["Birthday Report", "Employee birthdays grouped by date within a chosen period."],
            ["Age Analysis Report", "Age-band summary with pie chart and drill-down to individual ages, categorised by department."],
            ["Service Analysis Report", "Service-range summary with pie chart and drill-down to individual service length."],
            ["Service Milestone Report", "Employees completing a specified number of years of service within a selected period."],
            ["Pending Confirmations Report", "Employees whose probation / confirmation is pending (and overdue) as of the run date."],
            ["Employee Joining Statistics", "Employees who joined within a specified period."],
            ["Resignations &amp; Separations List", "Employees who resigned or separated in a period, with last working day and separation type."],
            ["Previous Working Experience", "Prior work experience for a selected employee or group."],
            ["Employee Qualification Register", "Register of qualifications held by employees."],
            ["Professional Body Membership Statistics", "Membership statistics by professional body (e.g. CIMA, CA, IESL)."]
          ]
        }
      },
      {
        id: "reports-absence", title: "Absence reports", type: "table",
        intro: "Leave utilisation, pending leave requests and leave balances by department.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Employee Leave Status Details", "Leave taken per active employee, grouped by department, for a chosen leave year."],
            ["Employee Pending Leave Details", "Pending (unapproved) leave requests for active employees by department in the current leave year."],
            ["Employee Leave Balance Summary", "Leave utilisation and remaining balances for all active employees in the current leave year."]
          ]
        }
      },
      {
        id: "reports-time-attendance", title: "Time & attendance reports", type: "table",
        intro: "Daily attendance control and period reports that support payroll: overtime, rosters, shift adjustments and timesheets.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Daily Attendance Report", "Attendance for a selected date, with a status filter (present, late, absent, on leave)."],
            ["Daily Late Report", "Employees who arrived late on a date, with late minutes."],
            ["Daily Absence &amp; Leave Report", "Employees absent on a date, showing whether it is on approved leave or unexplained."],
            ["Individual Attendance Report", "Attendance details for individual employee(s) for a date / period."],
            ["Invalid Attendance (Missed Punch) Report", "Employees with invalid or missing in / out punches for a date."],
            ["Overtime Details Report", "Overtime hours and values grouped by overtime type."],
            ["Overtime Reasons Report", "Overtime hours grouped by reason and roster."],
            ["Roster Schedules Report", "Roster schedules for a selected roster group for a month."],
            ["Shift Adjustment Report", "Shift adjustments for a business unit within a period."],
            ["Timesheet Report", "Timesheets for a business unit for a period."]
          ]
        }
      },
      {
        id: "reports-employee-life-cycle", title: "Employee life cycle reports", type: "table",
        intro: "Promotions, transfers and other movements, with views of applications still awaiting approval.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Employee Promotion Details", "All promotions in a selected period with old / new designation and grade."],
            ["Employee Transfer Details", "Employee movements by division for a selected movement type."],
            ["Movement Type Variation Graph", "Trend of different movement types (promotion, transfer, etc.) plotted together."],
            ["Pending Movement Applications", "Ongoing employee movement applications waiting for approval."],
            ["Application Details by Stage &amp; Type", "Applications at a selected processing stage for a selected application type."],
            ["Application History (Short-listed)", "History of short-listed applications for a selected application type."],
            ["Movement Changes by Employee &amp; Type", "Applications made by a selected employee for a selected stage and type (initial, short-list, assessment)."]
          ]
        }
      },
      {
        id: "reports-recruitment", title: "Recruitment reports", type: "table",
        intro: "Vacancy, applicant and interview-process reports for recruitment teams and hiring managers.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Applicant Details by Position", "Applicants for a selected position."],
            ["Business Unit Vacancies", "Open vacancies in a selected business unit."],
            ["Interview Panel &amp; Member Details", "Panel composition with member details and which panels each member sits on."],
            ["Interview Process Statistics", "Applicant status per selected vacancy (applied, shortlisted, interviewed, offered, rejected)."],
            ["Interview Profile Details", "Details of a selected interview profile (competencies, questions, criteria)."],
            ["Vacancy Recruitment Stage Details", "Status for a recruitment stage for a selected vacancy."]
          ]
        }
      },
      {
        id: "reports-payroll", title: "Payroll reports", type: "table",
        intro: "Reports organised around the payroll cycle: pay slips, reconciliations, exception checks, bank and cash payment lists and tax reporting.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Pay Slip", "Employee pay slip for a selected pay period, with a layout option (net and gross in one column, or gross-based)."],
            ["Annual Pay History", "Pay summary per employee over a selected period."],
            ["Payroll Grand Summary", "Grand totals of salaries and transactions in base currency for a single pay period or a date range."],
            ["Pay Sheet Currency Wise", "Hierarchy-level transaction amounts per currency, with employee-wise totals."],
            ["Monthly Basic Salary Reconciliation", "Month-on-month reconciliation of total basic salary, explaining movement (joiners, leavers, increments)."],
            ["Monthly Bank &amp; Cash Summary", "Amounts paid by bank transfer and by cash, by company and employee."],
            ["Bank Signature List", "Bank transactions list for employee signature or approval."],
            ["Cash Signature List", "Cash payment list with employee signature column."],
            ["Bank Account Reconciliation", "Bank reconciliation details for selected employee(s)."],
            ["Negative Salary Exceptions", "Employees whose net salary is negative in a period."],
            ["Tax Report", "Tax details for employees for a period and tax type."],
            ["Salary Increments Report", "Salary increments by pay period and increment status (approved, pending, processed)."],
            ["Revision Pay Slip", "Changed amounts on a revised pay slip (arrears, back-pay, corrections) for a selected employee and revision."],
            ["Statutory Contributions Detail (EPF)", "EPF employee and employer contribution amounts processed for a month."]
          ]
        }
      },
      {
        id: "reports-payroll-sri-lanka", title: "Payroll reports: Sri Lanka statutory", type: "table",
        intro: "Country-specific reports for tax, gratuity and stamp duty. Customers should confirm current statutory formats with the relevant authorities.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["T09 Report", "Income tax details for employees (available in all three languages)."],
            ["T6 Report", "Bi-annual tax deduction details for a particular employee in each month (available in all three languages)."],
            ["T10 Report", "Bi-annual tax deduction details for a particular employee in each month (available in all three languages)."],
            ["C Form Monthly", "Tax details of employer and employee for a given pay period."],
            ["Monthly PAYE Details", "PAYE tax details per employee in a period, in company currency with an option to show by currency."],
            ["Gratuity Eligibility Report", "Employees eligible for gratuity (more than 5 years' service) as of the run date."],
            ["Stamp Duty Report", "Stamp duty on employee salaries for a period and tax type."],
            ["Stamp Duty Summary Report", "Total stamp duty paid in a period."],
            ["Coin Summary Report", "Coin summary details of employees' salaries for a selected pay frequency, year and tax name."]
          ]
        }
      },
      {
        id: "reports-loans", title: "Loan reports", type: "table",
        intro: "Loan schemes, monthly recovery, reconciliation and outstanding balances.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Total Monthly Loan Summary", "Total loans for the organisation within a month, grouped by loan type, showing processed recoveries."],
            ["Monthly Loan Reconciliation", "Monthly reconciliation of loans by loan type."],
            ["Loan Summary Report", "Active, inactive and pending loan details for a selected loan type."],
            ["Employee Loan Summary", "Complete loan history and balances for a selected employee."],
            ["Loan Outstanding Report", "Processed loans with outstanding balances categorised by loan type."]
          ]
        }
      },
      {
        id: "reports-performance", title: "Performance reports", type: "table",
        intro: "Evaluation reports for supervisors, HR and leadership, from individual goal and competency details to 360-degree feedback summaries.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Annual Assessment Report", "Annual assessment details per employee."],
            ["Annual Assessment by Supervisor", "Mid-year and annual ratings given by a selected supervisor."],
            ["Competency Evaluation Details", "Competency evaluation for an employee (available once both parties have submitted)."],
            ["Critical Incident Journal by Type", "Critical incidents for a selected incident type."],
            ["Critical Incident Journal by Employee", "Critical incident journal entries for one employee."],
            ["Employees Assigned to Evaluation", "Employees assigned to a selected evaluation."],
            ["Achievements Report", "All achievements recorded for an employee."],
            ["Misses Report", "Misses recorded for an employee."],
            ["Interests Report", "Interests submitted by an employee."],
            ["Evaluation Details", "Evaluations in the system, with a status filter for ongoing evaluations."],
            ["Form Submission Status", "Status of forms submitted by employees (submitted, pending, overdue)."],
            ["Goal Planning Details", "Goal planning details for an employee (both parties must have submitted)."],
            ["Goal Evaluation Details", "Goal results and goal-group weightages for an employee."],
            ["Mid-Year Review Details", "Mid-year review details for an employee."],
            ["Rating Details &amp; Training Needs", "Ratings with training needs based on goal evaluation results for a completed evaluation."],
            ["Competency Group Summary", "Graphical comparison of functional vs core competencies across evaluator levels."],
            ["Group-wise Assessment Participation Summary", "Planned vs actual assessment participation by level (peer, self, etc.)."],
            ["Individual Competency Assessment Report", "Graphical comparison of feedback categories for an employee."],
            ["Self vs Others Feedback Summary", "Compares self-evaluation with other categories for an employee."]
          ]
        }
      },
      {
        id: "reports-training", title: "Training & development reports", type: "table",
        intro: "Training needs, delivery, attendance, cost and employee training history.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Annual T&amp;D Expenditure and Days", "Annual training spend and number of training days per month."],
            ["Employee Training History", "All training attended by an employee."],
            ["Employees Trained by Subject", "Employees trained in a period, categorised by subject."],
            ["Program Register", "Attendance register for a programme for participant signatures."],
            ["Training Attendance Analysis", "Number nominated, registered and present for a course."],
            ["Training Cost per Employee", "Per-head cost for trainings in a period."],
            ["Training Needs by Department", "Training needs requested, by department."],
            ["Training Needs Summary", "Count of requests for each training need."],
            ["Mandatory Training Due &amp; Overdue", "Employees yet to complete required training."]
          ]
        }
      },
      {
        id: "reports-manpower-planning", title: "Manpower planning reports", type: "table",
        intro: "Division-wise cadre planning, change requests, plan versions and deficits.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["HR Plan - Cadre Budget", "Division-wise budgeted cadre for a year."],
            ["HR Plan - Change Requests &amp; Status", "Change requests to the HR plan with their approval status by division."],
            ["HR Plan - Version History", "Version history of the HR plan by division."],
            ["HR Plan - Deficit vs Prior Year", "Division-wise HR deficit, comparing last year and current year."]
          ]
        }
      },
      {
        id: "reports-disciplinary", title: "Disciplinary reports", type: "table",
        intro: "Open and completed incidents, proceedings and trends.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Ongoing Disciplinary Incidents", "Disciplinary incidents pending approval or in progress."],
            ["Completed Disciplinary Incidents", "Completed incidents from a selected date to the run date, grouped by incident type or by action taken."],
            ["Disciplinary Proceedings", "Details of a selected incident for an employee."],
            ["Disciplinary Trend by Period", "Graph of incidents by period (year, quarter, etc.)."]
          ]
        }
      },
      {
        id: "reports-system-administration", title: "System administration reports", type: "table",
        intro: "Reports that support administrators in monitoring workflow across modules.",
        note: "Your plan covers set-up of up to 5 standard reports per licensed module, chosen from this list. Additional or custom reports depend on your plan&#39;s entitlements; where you need more than your plan allows, the next plan up provides it.",
        data: {
          columns: ["Report", "What it shows"],
          rows: [
            ["Pending Workflow Approvals", "Pending approvals across all modules, grouped by approval type and approver."]
          ]
        }
      }
    ]
  }
];

(function () {
  "use strict";

  var sidebarNav = document.getElementById("cdSidebarNav");
  var contentEl = document.getElementById("cdContent");
  if (!sidebarNav || !contentEl) return;

  var navLinks = [];   // { id, linkEl, groupTriggerEl, groupBodyEl }
  var sections = [];   // { id, sectionEl }

  /* same product icons the navbar's Products menu uses; modules
     without an `icon` (e.g. Standard Reports) render label-only */
  function moduleIcon(mod) {
    return mod.icon ? "<img class=\"cd-mod-icon\" src=\"" + mod.icon + "\" alt=\"\" width=\"20\" height=\"20\">" : "";
  }

  /* ---------- render sidebar ---------- */
  MODULES.forEach(function (mod, mi) {
    var group = document.createElement("div");
    group.className = "cd-group";

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "mobile-nav-link";
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = "<span class=\"cd-group-label\">" + moduleIcon(mod) + mod.module + "</span>" +
      "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9l6 6 6-6\"/></svg>";

    var body = document.createElement("div");
    body.className = "mobile-sub";

    var list = document.createElement("ul");
    list.className = "cd-group-list";
    list.style.listStyle = "none";

    mod.items.forEach(function (item) {
      if (item.hidden) return; // not ready for launch yet — see capability-details.js's `hidden` items
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + item.id;
      a.className = "cd-nav-link";
      a.textContent = item.title;
      a.dataset.target = item.id;
      li.appendChild(a);
      list.appendChild(li);
      navLinks.push({ id: item.id, linkEl: a, groupTriggerEl: trigger, groupBodyEl: body });
    });

    body.appendChild(list);
    group.appendChild(trigger);
    group.appendChild(body);
    sidebarNav.appendChild(group);

    trigger.addEventListener("click", function () {
      toggleGroup(trigger, body);
    });
  });

  /* ---------- render main content ---------- */
  MODULES.forEach(function (mod) {
    mod.items.forEach(function (item) {
      if (item.hidden) return; // not ready for launch yet — see capability-details.js's `hidden` items
      var section = document.createElement("section");
      section.className = "cd-section";
      section.id = item.id;

      var eyebrow = document.createElement("span");
      eyebrow.className = "phr-section__label cd-eyebrow";
      eyebrow.style.setProperty("--cd-accent", mod.accent);
      eyebrow.innerHTML = moduleIcon(mod) + mod.module;

      var h2 = document.createElement("h2");
      h2.className = "phr-section__title cd-title";
      h2.textContent = item.title;

      var intro = document.createElement("p");
      intro.className = "phr-section__sub cd-intro";
      intro.textContent = item.intro;

      section.appendChild(eyebrow);
      section.appendChild(h2);
      section.appendChild(intro);
      if (item.note) {
        var note = document.createElement("p");
        note.className = "cd-note";
        note.style.setProperty("--cd-accent", mod.accent);
        note.innerHTML = item.note;
        section.appendChild(note);
      }
      section.appendChild(renderBody(item));

      contentEl.appendChild(section);
      sections.push({ id: item.id, sectionEl: section });
    });
  });

  function renderBody(item) {
    if (item.type === "table") {
      var wrap = document.createElement("div");
      wrap.className = "cd-table-wrap";
      var table = document.createElement("table");
      table.className = "cd-table";

      var thead = document.createElement("thead");
      var trh = document.createElement("tr");
      item.data.columns.forEach(function (col) {
        var th = document.createElement("th");
        th.textContent = col;
        trh.appendChild(th);
      });
      thead.appendChild(trh);

      var tbody = document.createElement("tbody");
      item.data.rows.forEach(function (row) {
        var tr = document.createElement("tr");
        row.forEach(function (cell) {
          var td = document.createElement("td");
          td.innerHTML = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      wrap.appendChild(table);
      return wrap;
    }

    if (item.type === "list") {
      var ul = document.createElement("ul");
      ul.className = "cd-list";
      var lastGroup = null;
      item.data.forEach(function (entry) {
        /* an entry's optional `group` (e.g. a country) renders as a
           subheading whenever it changes from the previous entry —
           lets one list span several jurisdictions without repeating
           the group name in every item's own label. Lists with no
           `group` on their entries render exactly as before. */
        if (entry.group && entry.group !== lastGroup) {
          var groupLi = document.createElement("li");
          groupLi.className = "cd-list-group";
          var flag = GROUP_FLAGS[entry.group];
          groupLi.textContent = (flag ? flag + " " : "") + entry.group;
          ul.appendChild(groupLi);
          lastGroup = entry.group;
        }
        var li = document.createElement("li");
        var name = document.createElement("span");
        name.className = "cd-list-name";
        name.textContent = entry.name;
        var desc = document.createElement("span");
        desc.className = "cd-list-desc";
        desc.textContent = entry.desc;
        li.appendChild(name);
        li.appendChild(desc);
        ul.appendChild(li);
      });
      return ul;
    }

    /* prose */
    var wrapDiv = document.createElement("div");
    wrapDiv.className = "cd-prose";
    item.data.prose.forEach(function (para) {
      var p = document.createElement("p");
      p.textContent = para;
      wrapDiv.appendChild(p);
    });
    if (item.data.list) {
      var pl = document.createElement("ul");
      item.data.list.forEach(function (line) {
        var li = document.createElement("li");
        li.textContent = line;
        pl.appendChild(li);
      });
      wrapDiv.appendChild(pl);
    }
    return wrapDiv;
  }

  /* ---------- accordion open/close ---------- */
  function toggleGroup(trigger, body) {
    var isOpen = trigger.classList.contains("open");
    if (isOpen) {
      trigger.classList.remove("open");
      body.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    } else {
      trigger.classList.add("open");
      body.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    }
  }

  function openGroup(trigger, body) {
    if (trigger.classList.contains("open")) return;
    trigger.classList.add("open");
    body.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
  }

  /* ---------- active link + scroll ---------- */
  var topbar = document.getElementById("cdTopbar");
  var currentActive = null;

  /* Suppressed until the initial scroll position (hash-driven or not) has
     settled, so the IntersectionObserver's first (pre-scroll) notification
     can't clobber the deep-linked active item before the page has moved. */
  var programmaticScroll = true;

  /* #nvBar (the sitewide navbar) is sticky in practice on this site (unlike
     the ph-lander copy this page's markup originated from), but its own
     sticky range ends well before the page has scrolled this far, so by
     the time a section reaches the top there's no navbar left to clear —
     only this page's own sticky topbar (mobile) needs to be cleared here. */
  function scrollOffset() {
    return (topbar && topbar.offsetHeight ? topbar.offsetHeight : 0) + 24;
  }

  /* Polls scroll position (rather than guessing a timeout) so scroll-spy
     stays suppressed for exactly as long as the browser is still moving —
     smooth scrolls and clamped/instant jumps near the bottom of the page
     both settle at unpredictable times. */
  function waitForScrollSettle(targetTop) {
    var lastY = window.scrollY;
    var framesLeft = 180; /* ~3s safety cap at 60fps */
    function check() {
      var y = window.scrollY;
      var reached = Math.abs(y - targetTop) < 2;
      var stable = Math.abs(y - lastY) < 0.5;
      lastY = y;
      framesLeft -= 1;
      if ((reached && stable) || framesLeft <= 0) {
        programmaticScroll = false;
        return;
      }
      requestAnimationFrame(check);
    }
    requestAnimationFrame(check);
  }

  function setActive(id, expand) {
    if (id === currentActive) {
      if (expand) {
        var found = navLinks.filter(function (n) { return n.id === id; })[0];
        if (found) openGroup(found.groupTriggerEl, found.groupBodyEl);
      }
      return;
    }
    currentActive = id;
    navLinks.forEach(function (n) {
      var active = n.id === id;
      n.linkEl.classList.toggle("cd-nav-link--active", active);
      if (active && expand) openGroup(n.groupTriggerEl, n.groupBodyEl);
    });
  }

  function scrollToSection(id, instant) {
    var target = document.getElementById(id);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - scrollOffset();
    var maxTop = document.documentElement.scrollHeight - window.innerHeight;
    top = Math.max(0, Math.min(top, maxTop));
    programmaticScroll = true;
    window.scrollTo({ top: top, behavior: instant ? "auto" : "smooth" });
    waitForScrollSettle(top);
  }

  navLinks.forEach(function (n) {
    n.linkEl.addEventListener("click", function (e) {
      e.preventDefault();
      history.replaceState(null, "", "#" + n.id);
      setActive(n.id, true);
      scrollToSection(n.id);
      closeDrawer();
    });
  });

  /* ---------- scroll-spy ---------- */
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      if (programmaticScroll) return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id, true);
      });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

    sections.forEach(function (s) { spy.observe(s.sectionEl); });
  }

  /* The moment the visitor drives the page themselves, hand control back to
     scroll-spy immediately rather than waiting out a settle poll for a
     programmatic scroll they've since interrupted. */
  ["wheel", "touchstart", "keydown"].forEach(function (evt) {
    window.addEventListener(evt, function () { programmaticScroll = false; }, { passive: true });
  });

  /* ---------- deep link on load ---------- */
  function initFromHash() {
    var hash = decodeURIComponent((location.hash || "").replace("#", ""));
    if (hash && document.getElementById(hash)) {
      setActive(hash, true);
      requestAnimationFrame(function () { scrollToSection(hash, true); });
    } else {
      if (sections.length) setActive(sections[0].id, true);
      waitForScrollSettle(window.scrollY);
    }
  }
  initFromHash();

  /* ---------- mobile drawer ---------- */
  var hamburger = document.getElementById("cdHamburger");
  var sidebar = document.getElementById("cdSidebar");
  var overlay = document.getElementById("cdOverlay");

  function openDrawer() {
    hamburger.classList.add("open");
    sidebar.classList.add("cd-sidebar--open");
    overlay.classList.add("cd-overlay--visible");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    if (!hamburger) return;
    hamburger.classList.remove("open");
    sidebar.classList.remove("cd-sidebar--open");
    overlay.classList.remove("cd-overlay--visible");
    document.body.style.overflow = "";
  }
  if (hamburger && sidebar && overlay) {
    hamburger.addEventListener("click", function () {
      if (sidebar.classList.contains("cd-sidebar--open")) closeDrawer();
      else openDrawer();
    });
    overlay.addEventListener("click", closeDrawer);
    window.addEventListener("resize", function () {
      if (window.innerWidth > 840) closeDrawer();
    });
  }
})();

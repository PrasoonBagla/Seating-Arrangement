# Seating Arrangement Setup

## Starting Points

![Placeholder Image](/images_for_readme/HomePage.png)

### Necessary Input Documents:

**1. Excel Document:**  
A reference Excel document format is provided below:

![Placeholder Image](/images_for_readme/Excel_sample.png)

Ensure the document is precisely named "DATA.xlsx". The columns "Course No", "Date", "Time", "Count" must not be altered, as deviations will result in failure to generate any output.

- **Date Format:** Must follow the pattern "MM/DD/YYYY, Day-of-Week" (e.g., "03/05/2024, Friday").
- **Time Format:** Should be in the "Start Time - End Time" format (e.g., "10:00 AM - 11:30 AM").

Any discrepancies in the specified formats may lead to errors or no output being generated.

**2. Data Text Document:** 

A sample Data Text file format is as shown:

![Placeholder Image](/images_for_readme/Data_text_file.png)

**Note:** This document should remain unchanged unless there is a need to update room capacities.

### Generated Output Documents:

**1. Data by Room:**

Generates results for each specified time slot and room.

**2. Data by Course:** 

Produces outcomes for each time slot and course.

**Note:** An entry of 1 in the Shared column signifies that the course is being shared with another course, while 0 indicates no sharing.

**3. Data by Matrix:** 

Displays results for each time slot, with all classrooms and lecture theatres represented as individual columns.

## Local Setup

Clone the repository:

```bash
git clone https://github.com/PrasoonBagla/Seating-Arrangment-1.git
```

Navigate to the project folder:

```bash
cd seating
```

Install necessary packages:

```bash
npm install
```

Launch the Frontend:

```bash
npm start
```

Switch to the Backend folder:

```bash
cd Backend
```

Start the Backend server:

```bash
npm start
```

## Technology Stack

**Frontend:** ReactJS

**Backend:** Node, Express

## Support

For assistance, reach out to f20201159@goa.bits-pilani.ac.in.

## Contributors

- [Prasoon Bagla](https://github.com/PrasoonBagla)
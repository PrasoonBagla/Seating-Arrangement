
# Seating Arrangment




## Get Started

 ![Alt text](/images_for_readme/Homepage-new.png)

**Input Files:**

**1. Excel Sheet:**  
Sample Excel document should look like:

 ![Alt text](/images_for_readme/Excel_sample.png)

Name of the excel uploaded should be "DATA.xlsx" only.

Here column name "Course No", "Date", "Time", "Count" should remain same any changes in this will result in no output.
 
Format for Date should be Date seperated by a comma then space and then day for example "03/05/2024, Friday"
    
Format for Time should be seperated by a hyphen for example "10:00 AM - 11:30 AM"

any changes in the above format will lead to no output or Error. 

**2. Data Text File:** 

Data Text file should look like:

 ![Alt text](/images_for_readme/Data_text_file.png)

 **This file should not be altered untill unless a room capacity is changed**



**Output Files:**

**1. Room Wise Data:**

This will give results for each time slot and each room.

**2. Course Wise Data:** 

This will give results for each time slot and each Course.

**Note:** Shared column entry 1 means that course is shared with other course and 0 means not shared.

**2. Matrix Wise Data:** 

This will give results for each time slot and with all classrooms and LT's as seperate column.

**Updated Matrix File:**

 ![Alt text](/images_for_readme/UPDATED.png)

**Matrix Excel Sheet:**  
Sample Excel document should look like:

 ![Alt text](/images_for_readme/updated_excel.png)

Here column name "Date", "Time", "Course Name", "Total Capacity", "Total Rooms Used" and all the Room Numbers should remain same any changes in this will result in no output.
 
Format for Date should be Date seperated by a comma then space and then day for example "03/05/2024, Friday"
    
Format for Time should be seperated by a hyphen for example "10:00 AM - 11:30 AM"

any changes in the above format will lead to no output or Error. 







## Run Locally

Clone the project

```bash
  git clone https://github.com/PrasoonBagla/Seating-Arrangment-1.git
```

Go to the project directory

```bash
  cd seating
```

Install dependencies

```bash
  npm install
```

Run Frontend

```bash
  npm start
```
Go to backend directory

```bash
   cd Backend
```
Run Backend

```bash
   npm start
```


## Tech Stack

**Client:** ReactJS

**Server:** Node, Express


## Support

For support, email f20201159@goa.bits-pilani.ac.in


## Authors

- [@PrasoonBagla](https://github.com/PrasoonBagla)


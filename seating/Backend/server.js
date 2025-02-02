const express = require('express');
const app = express();
const { exec } = require('child_process');
const cors = require('cors');
// const ExcelJS = require('exceljs');
// const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const stream = require('stream');
const fs1 = require('fs').promises;
const ExcelJS = require('exceljs');
const node = require('./Nodes');
const multer = require('multer');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const fs = require('fs');
const path = require('path');
const excel = require('./excel');
const Nodes = require('./Nodes');
const Aside = require('./A-side');
const Cside = require('./C-side');
const allClasses = [
  "A501", "A502", "A503", "A504", "A505", "A506", "A507", "A508", 
  "A601", "A602", "A603", "A604", "A605",
  "C301", "C302", "C303", "C304", "C305", "C306", "C307", "C308", 
  "C401", "C402", "C403", "C404", "C405",
  "DLT10", "DLT8", "DLT7", "DLT6", "DLT5",
  "LT1", "LT2", "LT3", "LT4",
  "CCz1", "CCz2", "CCz3"
];

let securityPersonnel = {};
let invigilators = {};
let weights = {};
let distances = {};
let capacities = {};
let Asidedistances = {};
let ASoftsidecapacities = {};
let AHardsidecapacities = {};
let Csidedistances = {};
let Dsidedistances = {};
let CSoftsidecapacities = {};
let CHardsidecapacities = {};
let DSoftsidecapacities = {};
let DHardsidecapacities = {};
let LTSoftsidecapacities = {};
let LTHardsidecapacities = {};
let CCSoftsidecapacities = {};
let CCHardsidecapacities = {};
const port = 9000;
const parseValueList = (list, isWeight = false) => {
  if (isWeight) {
      return list.map(Number);
  }

  const result = {};
  list.forEach(item => {
      const [key, value] = item.split(' ');
      result[key] = Number(value);
  });
  return result;
};
//########################################DATA.TXT UPLOAD##################################################
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Set the destination directory relative to the server file location
    const backendDirPath = path.join(__dirname, '../Backend/');
    // Ensure the directory exists, create if not
    fs.mkdirSync(backendDirPath, { recursive: true });
    cb(null, backendDirPath);
  },
  filename: function(req, file, cb) {
    // Set the filename to 'data.txt', overwriting any existing file
    cb(null, 'data.txt');
  }
});

const upload = multer({ storage: storage });
app.post('/uploaddata', upload.single('file'), async (req, res) => {
  if (req.file) {
    console.log('File uploaded and saved as data.txt');
    try {
      await processFile(); // Call your existing function to process the file
      res.send({ message: 'File processed successfully' });
    } catch (error) {
      console.error('Error processing the file:', error);
      res.status(500).send('Error processing the file');
    }
  } else {
    res.status(400).send({ message: 'Please upload a file.' });
  }
});
//##########################################################################################
const processFile = async () => {
  const filePath = path.join(__dirname, '../Backend/data.txt');
  try {
      const data = await fs1.readFile(filePath, { encoding: 'utf8' });
      const lines = data.split('\n');

      lines.forEach(line => {
          if (line.trim()) {
              const [key, valueString] = line.split(' = ');
              const valueList = valueString.split(',').map(value => value.trim());

              switch (key) {
                  case 'securityPersonnel':
                      securityPersonnel = parseValueList(valueList);
                      break;
                  case 'invigilators':
                      invigilators = parseValueList(valueList);
                      break;
                  case 'w1, w2, w3':
                      weights = parseValueList(valueList, true);
                      break;
                  case 'distances':
                      distances = parseValueList(valueList);
                      break;
                  case 'capacities':
                      capacities = parseValueList(valueList);
                      break;
                  case 'Asidedistances':
                      Asidedistances = parseValueList(valueList);
                      break;
                  case 'ASoftsidecapacities':
                      ASoftsidecapacities = parseValueList(valueList);
                      break;
                  case 'AHardsidecapacities':
                      AHardsidecapacities = parseValueList(valueList);
                      break;
                  case 'Csidedistances':
                      Csidedistances = parseValueList(valueList);
                      break;
                  case 'Dsidedistances':
                      Dsidedistances = parseValueList(valueList);
                      break;
                  case 'CSoftsidecapacities':
                      CSoftsidecapacities = parseValueList(valueList);
                      break;
                  case 'CHardsidecapacities':
                      CHardsidecapacities = parseValueList(valueList);
                      break;
                  case 'DSoftsidecapacities':
                      DSoftsidecapacities = parseValueList(valueList);
                      break;
                  case 'DHardsidecapacities':
                      DHardsidecapacities = parseValueList(valueList);
                      break;
                  case 'LTSoftsidecapacities':
                      LTSoftsidecapacities = parseValueList(valueList);
                      break;
                  case 'LTHardsidecapacities':
                      LTHardsidecapacities = parseValueList(valueList);
                      break;
                  case 'CCSoftsidecapacities':
                      CCSoftsidecapacities = parseValueList(valueList);
                      break;
                  case 'CCHardsidecapacities':
                      CCHardsidecapacities = parseValueList(valueList);
                      break;
                  default:
                  // console.log(`Unrecognized key: ${key}`);
              }
          }
      });
  } catch (err) {
      console.error("Error reading the file:", err);
  }
};
processFile();

function organizeDataByDateTimeCourse(data) {
 
  const organizedData = {};

  Object.entries(data).forEach(([dateTime, rooms]) => {
    if (!organizedData[dateTime]) {
      organizedData[dateTime] = {};
    }

    Object.entries(rooms).forEach(([room, courses]) => {
      courses.forEach(course => {
        const { courseName1, temp1 } = course;
        if (!organizedData[dateTime][courseName1]) {
          organizedData[dateTime][courseName1] = { rooms: {}, totalStudents: 0 };
        }

        // Aggregate room and student count for each course within a dateTime
        organizedData[dateTime][courseName1].rooms[room] = temp1;
        organizedData[dateTime][courseName1].totalStudents += temp1;
      });
    });
  });

  return organizedData;
}
function getRoomHardCapacity(room) {
  if (room.startsWith("C")) {
      return CHardsidecapacities[room];
  } else if (room.startsWith("A")) {
      return AHardsidecapacities[room];
  } else if (room.startsWith("D")) {
      return DHardsidecapacities[room];
  } else if (room.startsWith("LT")) {
      return LTHardsidecapacities[room];
  } else if (room.startsWith("CC")) {
      return CCHardsidecapacities[room];
  } else {
      // Default or error handling if room doesn't fit any category
      console.error("Unknown room prefix for hard capacity lookup:", room);
      return null;
  }
}
//################################################# OLD REDISTRIBUTION FUNCTION###########################
// function redistributeStudents(courseData) {
//   // if (!courseData) continue; // Early return if courseData is undefined or null

//   // Make a deep copy of the original courseData to revert changes if necessary
//   const originalCourseData = JSON.parse(JSON.stringify(courseData));

//   Object.entries(courseData).forEach(([dateTime, courses]) => {
//       Object.entries(courses).forEach(([courseName, courseDetails]) => {
//           if (!courseDetails || !courseDetails.rooms) return; // Skip if courseDetails or rooms is undefined

//           // Find the room with the minimum capacity
//           let minRoom = null;
//           let minCapacity = Infinity;
//           Object.entries(courseDetails.rooms).forEach(([room, studentCount]) => {
//               if (studentCount < minCapacity) {
//                   minRoom = room;
//                   minCapacity = studentCount;
//               }
//           });

//           // Attempt to redistribute students from the min capacity room
//           let studentsLeftToRedistribute = minCapacity;
//           if (minRoom) {
//               Object.entries(courseDetails.rooms).forEach(([room, studentCount]) => {
//                   if (room !== minRoom) {
//                       let roomHardCapacity = getRoomHardCapacity(room);
//                       let availableCapacity = roomHardCapacity - studentCount;
//                       if (availableCapacity > 0 && studentsLeftToRedistribute > 0) {
//                           let redistributeCount = Math.min(studentsLeftToRedistribute, availableCapacity);
//                           courseDetails.rooms[room] += redistributeCount;
//                           studentsLeftToRedistribute -= redistributeCount;
//                       }
//                   }
//               });

//               // Check if all students were successfully redistributed
//               if (studentsLeftToRedistribute === 0) {
//                   // Successfully redistributed, remove the min capacity room
//                   delete courseDetails.rooms[minRoom];
//               } else {
//                   // Redistribution failed, revert to original state for this course
//                   courseData[dateTime][courseName] = originalCourseData[dateTime][courseName];
//               }
//           }
//       });
//   });
//   return courseData;
// }
//################################################################transform to room wise data############
function transformScheduleData(scheduleData) {
  // Initialize an empty object for the transformed schedule
  const transformedSchedule = {};

  // Iterate over each date-time slot in the schedule data
  Object.keys(scheduleData).forEach((dateTimeSlot) => {
    const courses = scheduleData[dateTimeSlot];
    const transformedCourses = {};

    // Transform each course within the current date-time slot
    Object.entries(courses).forEach(([courseName, courseDetails]) => {
      const { rooms } = courseDetails; // Destructure to get the rooms object

      // Iterate through each room for the current course
      Object.entries(rooms).forEach(([roomName, studentCount]) => {
        // Initialize the room in the transformed structure if it doesn't exist
        if (!transformedCourses[roomName]) {
          transformedCourses[roomName] = [];
        }

        // Append the course details to the room
        transformedCourses[roomName].push({
          courseName1: courseName,
          temp1: studentCount,
        });
      });
    });

    // Assign the transformed courses object to the corresponding date-time slot in the output
    transformedSchedule[dateTimeSlot] = transformedCourses;
  });

  return transformedSchedule;
}

//################################################# NEW REDISTRIBUTION FUNCTION###########################
function redistributeStudents(courseData) {
  if (!courseData) return; 
  const roomCapacities = {}; 

  // Pre-compute the final capacities
  Object.entries(courseData).forEach(([dateTime, courses]) => {
    roomCapacities[dateTime] = {};

    Object.values(courses).forEach(courseDetails => {
      Object.entries(courseDetails.rooms).forEach(([room, studentCount]) => {
        roomCapacities[dateTime][room] = (roomCapacities[dateTime][room] || 0) + studentCount;
      });
    });
  });

  Object.entries(courseData).forEach(([dateTime, courses]) => {
    Object.entries(courses).forEach(([courseName, courseDetails]) => {
      if (!courseDetails || !courseDetails.rooms) return;

      let lastRedistribution = null;
      let redistributionOccurred = false;

      do {
        redistributionOccurred = false; 
        let minRoom = null;
        let minCapacity = Infinity;
        Object.entries(courseDetails.rooms).forEach(([room, studentCount]) => {
          if (studentCount < minCapacity) {
            minRoom = room;
            minCapacity = studentCount;
          }
        });

        if (minCapacity > 15 || Object.keys(courseDetails.rooms).length === 1) {
          break; 
        }
        let maxRoom = null;
        let maxFilledCapacity = -1;
        Object.entries(courseDetails.rooms).forEach(([room, studentCount]) => {
          let roomHardCapacity = getRoomHardCapacity(room);
          if (room !== minRoom && studentCount > maxFilledCapacity && roomCapacities[dateTime][room] < roomHardCapacity) {
            maxRoom = room;
            maxFilledCapacity = studentCount;
          }
        });

        if (minRoom && maxRoom) {
          let roomHardCapacity = getRoomHardCapacity(maxRoom);
          let availableCapacity = roomHardCapacity - roomCapacities[dateTime][maxRoom];
          let redistributeCount = Math.min(minCapacity, availableCapacity);

          if (redistributeCount > 0) {
            courseDetails.rooms[maxRoom] += redistributeCount;
            courseDetails.rooms[minRoom] -= redistributeCount;
            roomCapacities[dateTime][maxRoom] += redistributeCount;
            roomCapacities[dateTime][minRoom] -= redistributeCount;

            if (courseDetails.rooms[minRoom] === 0) {
              delete courseDetails.rooms[minRoom];
            }

            // Record the last successful redistribution
            lastRedistribution = { maxRoom, minRoom, redistributeCount };
            redistributionOccurred = true;
          }
        }
      } while (redistributionOccurred); 

      if (lastRedistribution) {
        let finalMinCapacity = Math.min(...Object.values(courseDetails.rooms));
        if (finalMinCapacity <= 6) {
          // Check the pre-computed final capacity to ensure we're not exceeding hard capacity
          if ((roomCapacities[dateTime][lastRedistribution.minRoom] || 0) + lastRedistribution.redistributeCount <= getRoomHardCapacity(lastRedistribution.minRoom)) {
            courseDetails.rooms[lastRedistribution.minRoom] = (courseDetails.rooms[lastRedistribution.minRoom] || 0) + lastRedistribution.redistributeCount;
            courseDetails.rooms[lastRedistribution.maxRoom] -= lastRedistribution.redistributeCount;

            // Update pre-computed capacities after undoing the redistribution
            roomCapacities[dateTime][lastRedistribution.minRoom] += lastRedistribution.redistributeCount;
            roomCapacities[dateTime][lastRedistribution.maxRoom] -= lastRedistribution.redistributeCount;

            if (courseDetails.rooms[lastRedistribution.maxRoom] === 0) {
              delete courseDetails.rooms[lastRedistribution.maxRoom];
            }
          }
        }
      }
    });
  });
  return courseData;
}
/////////////////////////////////COURSE WISE ALLOCATION/////////////////////////////////////////////////
async function createCoursesToRoomsExcel(data) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Courses to Rooms Allocation');

  // Define columns
  sheet.columns = [
    { header: 'Date', key: 'date' },
    { header: 'Time', key: 'time' },
    { header: 'Course Name', key: 'courseName' },
    { header: 'Rooms and Students', key: 'rooms' },
    { header: 'Number of Rooms', key: 'numRooms' },
    { header: 'Total Course Count', key: 'totalCourseCount' },
    { header: 'Shared', key: 'shared' } // New column for Shared
  ];

  // Iterate over each dateTime slot
  Object.entries(data).forEach(([dateTime, courses]) => {
    const [date, time] = dateTime.split('_'); // Extract date and time

    // Create a Room Usage Map for the current date and time slot
    let roomUsageMap = {};
    Object.values(courses).forEach(course => {
      Object.keys(course.rooms).forEach(room => {
        roomUsageMap[room] = (roomUsageMap[room] || 0) + 1;
      });
    });

    // Iterate over courses
    Object.entries(courses).forEach(([courseName, courseDetails]) => {
      const rooms = Object.entries(courseDetails.rooms)
        .map(([room, count]) => `${room} (${count})`) // Format room entries
        .join(', ');

      const numRooms = Object.keys(courseDetails.rooms).length; // Count of rooms
      const totalCourseCount = courseDetails.totalStudents; // Total students for course

      // Determine if any room for this course is shared within the same time slot
      const shared = Object.keys(courseDetails.rooms).some(room => roomUsageMap[room] > 1) ? 1 : 0;

      // Add row for each course
      sheet.addRow({
        date: date.trim(),
        time: time.trim(),
        courseName: courseName,
        rooms: rooms,
        numRooms: numRooms,
        totalCourseCount: totalCourseCount,
        shared: shared // Add Shared value to the row
      });
    });
  });
  const filePath = 'courses_to_rooms_with_counts_allocation.xlsx';
  await workbook.xlsx.writeFile(filePath);
  console.log(`File has been written to ${filePath}`);
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}



/////////////////////////////////////////////MATRIX WISE//////////////////////
async function prepareDataAndWriteToExcelUsingExcelJS(data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Courses');

  // Define the columns in your worksheet, adding the Total Rooms Used column
  sheet.columns = [
    { header: 'Date', key: 'date', width: 10 },
    { header: 'Time', key: 'time', width: 10 },
    { header: 'Course Name', key: 'courseName', width: 30 },
    { header: 'Total Capacity', key: 'totalCapacity', width: 15 },
    { header: 'Total Rooms Used', key: 'totalRoomsUsed', width: 15 }, // New column for counting non-blank room entries
    ...allClasses.map(classroom => ({
        header: classroom,
        key: classroom,
        width: 5
    }))
  ];

  // Transform the data object into a format suitable for ExcelJS
  Object.entries(data).forEach(([dateTime, courses]) => {
    const [date, time] = dateTime.split('_');
    Object.entries(courses).forEach(([courseName, courseDetails]) => {
      // Initialize the row object
      const row = {
        date: date.trim(),
        time: time.trim(),
        courseName,
        totalCapacity: courseDetails.totalStudents,
        totalRoomsUsed: 0 // Initialize totalRoomsUsed
      };

      // Count non-blank room entries and fill row data
      let nonBlankRoomCount = 0;
      allClasses.forEach(classroom => {
        if (courseDetails.rooms[classroom]) {
          row[classroom] = courseDetails.rooms[classroom];
          nonBlankRoomCount++;
        } else {
          row[classroom] = null; // Explicitly set to empty string (could be omitted)
        }
      });

      // Set the totalRoomsUsed value for the row
      row.totalRoomsUsed = nonBlankRoomCount;

      // Add the row to the sheet
      sheet.addRow(row);
    });
  });

  // Define the path and filename for the Excel file
  const filePath = path.resolve(__dirname, 'CourseSchedule.xlsx');
  // Save the workbook to the filesystem
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file has been created at ${filePath}`);
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

/////////////////////////////////ROOM WISE ALLOCATION/////////////////////////////////////////////////
async function createSecondExcel(data) {
  const ExcelJS = require('exceljs'); // Assuming ExcelJS is already installed
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Course Allocations by Room');

  // Adjust sheet columns to include Date and Time
  sheet.columns = [
    { header: 'Date', key: 'date' },
    { header: 'Time', key: 'time' },
    { header: 'Room', key: 'room' },
    { header: 'Courses and Students', key: 'courses' }
  ];

  // Iterate over each dateTime slot
  Object.entries(data).forEach(([dateTime, rooms]) => {
    // Extract date and time from the dateTime key
    const [date, time] = dateTime.split('_');
    Object.entries(rooms).forEach(([room, courses]) => {
      if (courses.length > 0) { // Ensure there are courses in the room
        // Format courses and students for each room
        const coursesFormatted = courses.map(course => `${course.courseName1} (${course.temp1})`).join(', ');
        // Add a row for each room with the date, time, and formatted courses
        sheet.addRow({
          date: date.trim(),
          time: time.trim(),
          room: room,
          courses: coursesFormatted
        });
      }
    });
  });

  // Write to file
  const filePath = 'modified_courses_allocation.xlsx';
  await workbook.xlsx.writeFile(filePath);
  console.log(`File has been written to ${filePath}`);
  return await workbook.xlsx.writeBuffer();
}

// Use the same data_json as before
//////////////////////////////////////////////////////////////////////////////////
app.post('/', async (req, res) => {
  // Log the entire query object
  const { date, time } = req.body;
  console.log(date);
  console.log(time);
  if (!date || !time) {
    return res.status(400).send('Date and time are required');
  }
  try {
    let data_from_excel = await excel(date, time);
    // console.log(data_from_excel);
    let data_from_Nodes = await Nodes(data_from_excel)
    // console.log(data_from_Nodes);
    let data_from_Aside = await Aside(data_from_Nodes);
    // console.log(data_from_Aside);
    let data_from_Cside = await Cside(data_from_Nodes);
    // console.log(data_from_Cside[0].optimalSubset);
    let data = { ...data_from_Cside.y, ...data_from_Aside };
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value.length > 0) { // Checks if the array is not empty
        acc[key] = value; // Add the entry to the accumulator object
      }
      return acc;
    }, {});
    res.send({ data_from_excel, data_from_Nodes, data_from_Aside, data_from_Cside });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/matrixwise', async (req, res) => {
  const ispressed  = req.body;
  // console.log(ispressed);
  let finaldata = {};
  try {
    for(let i = 0; i<ispressed.uniqueDates.length;i++)
    {
       for(let j=0; j<ispressed.uniqueTimes.length;j++)
       {
        let date1 = ispressed.uniqueDates[i];
        let time1 = ispressed.uniqueTimes[j];
        let data_from_excel = await excel(ispressed.uniqueDates[i], ispressed.uniqueTimes[j]);
        // console.log(data_from_excel);
        let data_from_Nodes = await Nodes(data_from_excel)
        // console.log(data_from_Nodes);
        let data_from_Aside = await Aside(data_from_Nodes);
        // console.log(data_from_Aside);
        let data_from_Cside = await Cside(data_from_Nodes);
        // console.log(data_from_Cside);
        let dateTimeKey = `${date1}_${time1}`;
        // console.log(dateTimeKey)
        finaldata[dateTimeKey] = {...data_from_Cside.y, ...data_from_Aside};
        // console.log(finaldata['10/03/24, Sunday_9:00 AM - 10:30 AM']);
       }
    }
    Object.keys(finaldata).forEach(timeSlot => {
      const allClassroomsEmpty = Object.values(finaldata[timeSlot]).every(classroom => classroom.length === 0);
      if (allClassroomsEmpty) {
        delete finaldata[timeSlot];
      }
    });
    // console.log(finaldata['11/03/24, Monday_11:00 AM - 12:30 PM']);
    // createCoursesToRoomsExcel(finaldata);
    const organizeddata = organizeDataByDateTimeCourse(finaldata);
    // console.log(organizeddata);
    const redistributeData = redistributeStudents(organizeddata);
    // prepareDataAndWriteToExcelUsingExcelJS(redistributeData)
    const buffer = await prepareDataAndWriteToExcelUsingExcelJS(redistributeData);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="CourseSchedule.xlsx"');
    res.send(buffer);
    // console.log(redistributeData);
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/downloadcoursewise', async (req, res) => {
  const ispressed  = req.body;
  // console.log(ispressed);
  let finaldata = {};
  try {
    for(let i = 0; i<ispressed.uniqueDates.length;i++)
    {
       for(let j=0; j<ispressed.uniqueTimes.length;j++)
       {
        let date1 = ispressed.uniqueDates[i];
        let time1 = ispressed.uniqueTimes[j];
        let data_from_excel = await excel(ispressed.uniqueDates[i], ispressed.uniqueTimes[j]);
        // console.log(data_from_excel);
        let data_from_Nodes = await Nodes(data_from_excel)
        // console.log(data_from_Nodes);
        let data_from_Aside = await Aside(data_from_Nodes);
        // console.log(data_from_Aside);
        let data_from_Cside = await Cside(data_from_Nodes);
        // console.log(data_from_Cside);
        let dateTimeKey = `${date1}_${time1}`;
        // console.log(dateTimeKey)
        finaldata[dateTimeKey] = {...data_from_Cside.y, ...data_from_Aside};
        // console.log(finaldata['10/03/24, Sunday_9:00 AM - 10:30 AM']);
       }
    }
    Object.keys(finaldata).forEach(timeSlot => {
      const allClassroomsEmpty = Object.values(finaldata[timeSlot]).every(classroom => classroom.length === 0);
      if (allClassroomsEmpty) {
        delete finaldata[timeSlot];
      }
    });
    // console.log(finaldata['11/03/24, Monday_11:00 AM - 12:30 PM']);
    // createCoursesToRoomsExcel(finaldata);
    const organizeddata = organizeDataByDateTimeCourse(finaldata);
    // console.log(organizeddata['04/05/2024, Saturday_2:00 PM - 5:00 PM']);
    const redistributeData = redistributeStudents(organizeddata);
    // processSchedule(organizeddata);
    // console.log(redistributeData);
    // createCoursesToRoomsExcel(redistributeData);
    const buffer = await createCoursesToRoomsExcel(redistributeData);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="courses_to_rooms.xlsx"');
    res.send(buffer);
    // console.log(redistributeData['10/03/24, Sunday_11:00 AM - 12:30 PM']);
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/downloadroomwise', async (req, res) => {
  // Log the entire query object
  const ispressed  = req.body;
  let finaldata = {};
  try {
    for(let i = 0; i<ispressed.uniqueDates.length;i++)
    {
       for(let j=0; j<ispressed.uniqueTimes.length;j++)
       {
        let date1 = ispressed.uniqueDates[i];
        let time1 = ispressed.uniqueTimes[j];
        let data_from_excel = await excel(ispressed.uniqueDates[i], ispressed.uniqueTimes[j]);
        let data_from_Nodes = await Nodes(data_from_excel)
        let data_from_Aside = await Aside(data_from_Nodes);
        let data_from_Cside = await Cside(data_from_Nodes);
        let dateTimeKey = `${date1}_${time1}`;
        finaldata[dateTimeKey] = {...data_from_Cside.y, ...data_from_Aside };
       }
    }
    Object.keys(finaldata).forEach(timeSlot => {
      const allClassroomsEmpty = Object.values(finaldata[timeSlot]).every(classroom => classroom.length === 0);
      if (allClassroomsEmpty) {
        delete finaldata[timeSlot];
      }
    });
  //  console.log(finaldata['14/05/2024, Tuesday_2:00 PM - 5:00 PM']);
  const organizeddata = organizeDataByDateTimeCourse(finaldata);
  const redistributeData = redistributeStudents(organizeddata);
   
  const buffer = await createSecondExcel(transformScheduleData(redistributeData));
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="modified_courses_allocation.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).send('Internal Server Error');
  }
});

//#####################################################UPDATED REQUESTS########################################################
const storage1 = multer.diskStorage({
  destination: function(req, file, cb) {
    // Set the destination directory relative to the server file location
    const backendDirPath = path.join(__dirname, '../Backend/');
    // Ensure the directory exists, create if not
    fs.mkdirSync(backendDirPath, { recursive: true });
    cb(null, backendDirPath);
  },
  filename: function(req, file, cb) {
    // Set the filename to 'data.txt', overwriting any existing file
    cb(null, 'Updated_Matrix.xlsx');
  }
});

const upload_updated = multer({ storage: storage1 });
app.post('/updateduploaddataexcel', upload_updated.single('file'), async (req, res) => {
  if (req.file) {
    console.log('File uploaded and saved as Updated_data.xlsx');
    try {
      await processFile(); // Call your existing function to process the file
      res.send({ message: 'File processed successfully' });
    } catch (error) {
      console.error('Error processing the file:', error);
      res.status(500).send('Error processing the file');
    }
  } else {
    res.status(400).send({ message: 'Please upload a file.' });
  }
});

async function convertAndGenerateBuffer(inputFilePath) {
  const workbookXLSX = XLSX.readFile(inputFilePath);
  const firstSheetName = workbookXLSX.SheetNames[0];
  const worksheetXLSX = workbookXLSX.Sheets[firstSheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheetXLSX);

  // Group data by Date and Time to find shared rooms
  const groups = rawData.reduce((acc, item) => {
      const key = `${item.Date} ${item.Time}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
  }, {});

  const processedData = [];
  Object.keys(groups).forEach(slot => {
    const coursesInSlot = groups[slot];

    // Create room and course mapping for the current slot
    const roomUsageCounts = {};
    coursesInSlot.forEach(course => {
      Object.keys(course)
        .filter(key => !['Date', 'Time', 'Course Name', 'Total Capacity', 'Total Rooms Used'].includes(key) && course[key] !== null)
        .forEach(room => {
          if (!roomUsageCounts[room]) {
            roomUsageCounts[room] = new Set();
          }
          roomUsageCounts[room].add(course['Course Name']);
        });
    });

    // Process each course in the slot
    coursesInSlot.forEach(course => {
      const roomsAndStudents = Object.keys(course)
        .filter(key => !['Date', 'Time', 'Course Name', 'Total Capacity', 'Total Rooms Used'].includes(key) && course[key] !== null)
        .map(room => `${room} (${course[room]})`)
        .join(', ');

      // Check if the current course has any shared room
      const shared = Object.keys(course)
        .filter(room => !['Date', 'Time', 'Course Name', 'Total Capacity', 'Total Rooms Used'].includes(room) && course[room] !== null)
        .some(room => roomUsageCounts[room].size > 1);

      processedData.push({
        Date: course.Date,
        Time: course.Time,
        CourseName: course['Course Name'],
        RoomsAndStudents: roomsAndStudents,
        NumberOfRooms: roomsAndStudents.split(', ').length,
        TotalCourseCount: course['Total Capacity'],
        Shared: shared ? 1 : 0
      });
    });
  });

  // Creating a new Excel workbook and adding processed data
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Processed Data');

  worksheet.columns = [
      { header: 'Date', key: 'Date', width: 15 },
      { header: 'Time', key: 'Time', width: 20 },
      { header: 'Course Name', key: 'CourseName', width: 30 },
      { header: 'Rooms and Students', key: 'RoomsAndStudents', width: 50 },
      { header: 'Number of Rooms', key: 'NumberOfRooms', width: 20 },
      { header: 'Total Course Count', key: 'TotalCourseCount', width: 20 },
      { header: 'Shared', key: 'Shared', width: 10 },
  ];

  processedData.forEach(item => {
      worksheet.addRow(item);
  });

  // Write to a buffer instead of a file
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}


app.post('/updateddownloadcoursewise', async (req, res) => {
  const filePath = path.join(__dirname, 'Updated_Matrix.xlsx'); // Adjust the path as necessary
  try {
      const buffer = await convertAndGenerateBuffer(filePath);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="CourseSchedule.xlsx"');
      res.send(buffer);
  } catch (error) {
      console.error('Error generating Excel file:', error);
      res.status(500).send('An error occurred.');
  }
});
async function convertAndGenerateBuffer1(inputFilePath) {
  const formatCourseStudents = (courseName, studentCount) => `${courseName} (${studentCount})`;

  const workbookPrasoon = XLSX.readFile(inputFilePath);
  const sheetPrasoon = workbookPrasoon.Sheets[workbookPrasoon.SheetNames[0]];

  const dataPrasoon = XLSX.utils.sheet_to_json(sheetPrasoon, {header: 1});
  const rowsOut = [["Date", "Time", "Room", "Courses and Students"]];

  dataPrasoon.slice(1).forEach(row => {
    const [date, time, courseName, , , ...rooms] = row;
    rooms.forEach((studentCount, index) => {
      if (studentCount) {
        const roomName = dataPrasoon[0][index + 5];
        const courseStudents = formatCourseStudents(courseName, studentCount);
        rowsOut.push([date, time, roomName, courseStudents]);
      }
    });
  });

  const workbookOut = XLSX.utils.book_new();
  const wsOut = XLSX.utils.aoa_to_sheet(rowsOut);
  XLSX.utils.book_append_sheet(workbookOut, wsOut, 'Course Allocations by Room');

  // Write workbook to buffer
  return XLSX.write(workbookOut, {type: 'buffer', bookType: 'xlsx'});
}
app.post('/updateddownloadroomwise', async (req, res) => {
  const inputFilePath = path.join(__dirname, 'Updated_Matrix.xlsx'); // Adjust the path as necessary
  
  // Generate the Excel file as a buffer
  const buffer = await convertAndGenerateBuffer1(inputFilePath);

  // Set headers to instruct the browser to download the file
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="CourseSchedule1.xlsx"');
  res.send(buffer); // Send the buffer as the response
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
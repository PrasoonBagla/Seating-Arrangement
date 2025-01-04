import React from "react";
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Navbar from "./Navbar";
import * as XLSX from 'xlsx';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
const Entries = styled('div')({
    display: 'flex', 
    flexDirection: 'row',
    justifyContent: 'center',
    justifyItems: 'center',
    alignContent: 'center',
    gap: '20px'

});
const DownloadButton = styled(Button)({
    gap: '20px',
});
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1
});
const Updated = () => {
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const binaryString = event.target.result;
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
        };
        const formData = new FormData();
        formData.append('file', file); // Append the original file

        try {
            // Adjust the URL to your backend endpoint as needed
            const response = await axios.post('http://localhost:9000/updateduploaddataexcel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('File uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
        reader.readAsBinaryString(file);
    };
    const downloadroomwise = async () => {
       axios.post('http://localhost:9000/updateddownloadroomwise',{},{ responseType: 'blob' })
           .then(response => {
               const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
               const link = document.createElement('a');
               link.href = url;
               link.setAttribute('download', 'Updated_Room_Wise.xlsx'); // Specify the file name
               document.body.appendChild(link);
               link.click();
               
               // Clean up
               link.parentNode.removeChild(link);
               window.URL.revokeObjectURL(url);
               
           })
           .catch(error => {
               console.error('There was an error!', error);
               // Handle the error here
           });
   };
   const downloadcoursewise = async () => {
       axios.post('http://localhost:9000/updateddownloadcoursewise',{}, { responseType: 'blob' })
           .then(response => {
               const url = window.URL.createObjectURL(new Blob([response.data]));
           const link = document.createElement('a');
           link.href = url;
           link.setAttribute('download', 'Updated_courses_to_rooms.xlsx'); // Specify the file name
           document.body.appendChild(link);
           link.click();
           link.parentNode.removeChild(link);
           window.URL.revokeObjectURL(url);
               
           })
           .catch(error => {
               console.error('There was an error!', error);
               // Handle the error here
           });
   };
   
    return (
        <div>
            <Navbar />
            <h1>Seating Arrangement</h1>
            <Entries>
                <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} style={{ marginBottom: '8px' }}>
                    Upload Excel Sheet
                    <VisuallyHiddenInput
                        type="file"
                        onChange={handleFileUpload}
                    />
                </Button>
            </Entries>
            <DownloadButton>
                <Button
                    variant="contained"
                    size="medium"
                    startIcon={<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>}
                    onClick={downloadroomwise}
                >
                    Updated Room wise data
                </Button>
                <Button
                    variant="contained"
                    size="medium"
                    onClick={downloadcoursewise}
                    startIcon={<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>}
                >
                    Updated Course wise data
                </Button>
            </DownloadButton>
        </div>
    ) 
};
export default Updated;
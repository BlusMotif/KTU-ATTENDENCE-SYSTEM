
// Initialize attendance records and course title from localStorage
let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
let currentCourseTitle = localStorage.getItem('currentCourseTitle') || '';
let currentWeek = localStorage.getItem('currentWeek') || '';
const attendanceForm = document.getElementById('attendance-form');

// Set course title and week if they exist and lock them
if (currentCourseTitle) {
    document.getElementById('course-title').value = currentCourseTitle;
    document.getElementById('course-title').disabled = true;
    document.getElementById('week-number').value = currentWeek;
    document.getElementById('week-number').disabled = true;
} else {
    document.getElementById('course-title').disabled = false;
    document.getElementById('week-number').disabled = false;
}
const recordsList = document.getElementById('records');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const searchInput = document.getElementById('search-input');

// Set default date to today
document.getElementById('attendance-date').valueAsDate = new Date();

// Show notification
function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: 'right',
        backgroundColor: type === 'success' ? "#28a745" : "#dc3545"
    }).showToast();
}

// Update table with records
function updateTable(records = attendanceRecords) {
    recordsList.innerHTML = '';
    records.forEach((record, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${record.studentName}</td>
            <td>${record.indexNumber}</td>
            <td>${record.attendanceDate}</td>
            <td><span class="status-badge present">Present</span></td>
            <td>
                <button class="edit-btn" onclick="editRecord(${index})">✎</button>
                <button class="delete-btn" onclick="deleteRecord(${index})">×</button>
            </td>
        `;
        recordsList.appendChild(tr);
    });
}

// Handle form submission
attendanceForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const studentName = document.getElementById('student-name').value.trim();
    const indexNumber = document.getElementById('index-number').value.trim();
    const attendanceDate = document.getElementById('attendance-date').value;

    // Check for duplicates
    const isDuplicate = attendanceRecords.some(record => 
        record.indexNumber === indexNumber && 
        record.attendanceDate === attendanceDate
    );

    if (isDuplicate) {
        showToast("This student has already marked attendance for this date.", "error");
        return;
    }

    // Add new record
    const courseTitle = document.getElementById('course-title').value.trim();
    const weekNumber = document.getElementById('week-number').value.trim();
    currentCourseTitle = courseTitle;
    currentWeek = weekNumber;
    localStorage.setItem('currentCourseTitle', courseTitle);
    localStorage.setItem('currentWeek', weekNumber);
    attendanceRecords.push({ studentName, indexNumber, attendanceDate, courseTitle, weekNumber });
    
    // Hide course title and week fields after first entry
    document.getElementById('course-title').parentElement.parentElement.style.display = 'none';
    
    updateTable();
    showToast("Attendance marked successfully!");
    // Reset form but keep course title
    document.getElementById('student-name').value = '';
    document.getElementById('index-number').value = '';
    document.getElementById('attendance-date').valueAsDate = new Date();
    saveToLocalStorage();
});

// Search functionality
searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredRecords = attendanceRecords.filter(record => 
        record.studentName.toLowerCase().includes(searchTerm) ||
        record.indexNumber.includes(searchTerm)
    );
    updateTable(filteredRecords);
});

// Delete record
function deleteRecord(index) {
    if (confirm('Are you sure you want to delete this record?')) {
        attendanceRecords.splice(index, 1);
        updateTable();
        saveToLocalStorage();
        showToast("Record deleted successfully!");
    }
}

// Edit record
function editRecord(index) {
    const record = attendanceRecords[index];
    document.getElementById('student-name').value = record.studentName;
    document.getElementById('index-number').value = record.indexNumber;
    document.getElementById('attendance-date').value = record.attendanceDate;
    document.getElementById('course-title').value = record.courseTitle;
    
    attendanceRecords.splice(index, 1);
    updateTable();
    saveToLocalStorage();
    showToast("Edit the record and submit to update");
}

// Clear all records
clearBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all records?')) {
        attendanceRecords = [];
        currentCourseTitle = '';
        currentWeek = '';
        localStorage.removeItem('currentCourseTitle');
        localStorage.removeItem('currentWeek');
        document.getElementById('course-title').value = '';
        document.getElementById('week-number').value = '';
        document.getElementById('course-title').disabled = false;
        document.getElementById('week-number').disabled = false;
        document.getElementById('course-title').parentElement.parentElement.style.display = 'block';
        updateTable();
        saveToLocalStorage();
        showToast("All records cleared!");
    }
});

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
}

saveBtn.addEventListener('click', function() {
    saveToLocalStorage();
    showToast("Data saved successfully!");
});

// Export functionality
exportBtn.addEventListener('click', function() {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Attendance Records</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    h1 { text-align: center; color: #007bff; }
                </style>
            </head>
            <body>
                <h1>COMPUTER SCI BTECH (300) ATTENDANCE RECORDS</h1>
                <div style="display: flex; justify-content: space-between; margin: 20px 0;">
                    <h2>Course Title: ${attendanceRecords[0]?.courseTitle || 'N/A'}</h2>
                    <h2>Week: ${attendanceRecords[0]?.weekNumber || 'N/A'}</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Full Name</th>
                            <th>Index Number</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${attendanceRecords.map((record, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${record.studentName}</td>
                                <td>${record.indexNumber}</td>
                                <td>${record.attendanceDate}</td>
                                <td><span class="status-badge present">Present</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p style="text-align: right; margin-top: 20px;">
                    Date: ${new Date().toLocaleDateString()}
                </p>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
});

// Initial table update
updateTable();

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api/applications';

// --- UI Elements ---
const applicationForm = document.getElementById('application-form');
const companyInput = document.getElementById('company');
const roleInput = document.getElementById('role');
const deadlineInput = document.getElementById('deadline');
const statusInput = document.getElementById('status');

const filterCompanyInput = document.getElementById('filterCompany');
const filterRoleInput = document.getElementById('filterRole');
const filterStatusSelect = document.getElementById('filterStatus');

const applicationsTableBody = document.getElementById('applications-table-body');
const noApplicationsMessage = document.getElementById('no-applications-message');

const statusDistributionChart = document.getElementById('status-distribution-chart');
const totalApplicationsCount = document.getElementById('total-applications-count');
const statusDistributionSummary = document.getElementById('status-distribution-summary');

const upcomingDeadlinesList = document.getElementById('upcoming-deadlines-list');
const noUpcomingDeadlinesMessage = document.getElementById('no-upcoming-deadlines-message');

const pastDeadlinesList = document.getElementById('past-deadlines-list');
const noPastDeadlinesMessage = document.getElementById('no-past-deadlines-message');

const pendingApplicationsList = document.getElementById('pending-applications-list');
const noPendingApplicationsMessage = document.getElementById('no-pending-applications-message');

const followUpRemindersList = document.getElementById('follow-up-reminders-list');
const noFollowUpRemindersMessage = document.getElementById('no-follow-up-reminders-message');

// --- Data Fetching and Manipulation ---

// Fetches all applications from the backend
async function fetchApplications() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const applications = await response.json();
        updateUI(applications); // Update UI with fetched data
    } catch (error) {
        console.error("Error fetching applications:", error);
        // Display a user-friendly message, e.g., "Could not load applications."
        updateUI([]); // Render empty UI on error
    }
}

// Adds a new application to the backend
async function addApplication(app) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(app),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await response.json(); // Optionally get the added item back
        fetchApplications(); // Re-fetch to update UI
    } catch (error) {
        console.error("Error adding application:", error);
    }
}

// Updates an existing application's status in the backend
async function updateApplicationStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await response.json();
        fetchApplications(); // Re-fetch to update UI
    } catch (error) {
        console.error("Error updating application status:", error);
    }
}

// Deletes an application from the backend
async function deleteApplication(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await response.json();
        fetchApplications(); // Re-fetch to update UI
    } catch (error) {
        console.error("Error deleting application:", error);
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', fetchApplications); // Fetch data when page loads

applicationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newApp = {
        company: companyInput.value,
        role: roleInput.value,
        deadline: deadlineInput.value,
        status: statusInput.value,
    };

    if (newApp.company && newApp.role && newApp.deadline && newApp.status) {
        addApplication(newApp);
        applicationForm.reset(); // Clear form
        statusInput.value = ''; // Reset select explicitly
    } else {
        console.warn('Please fill in all fields (Company, Role, Deadline, and Status).');
    }
});

filterCompanyInput.addEventListener('input', () => fetchApplications());
filterRoleInput.addEventListener('input', () => fetchApplications());
filterStatusSelect.addEventListener('change', () => fetchApplications());

// --- UI Rendering Functions ---

function updateUI(allApplications) {
    const filteredApps = getFilteredApplications(allApplications);
    renderApplicationsTable(filteredApps);
    renderAnalysisSections(allApplications); // Analysis always on ALL data, not filtered
}

function getFilteredApplications(apps) {
    let filtered = [...apps]; // Create a copy to avoid modifying original array

    const filterCompany = filterCompanyInput.value.toLowerCase();
    const filterRole = filterRoleInput.value.toLowerCase();
    const filterStatus = filterStatusSelect.value;

    if (filterCompany) {
        filtered = filtered.filter(app => app.company.toLowerCase().includes(filterCompany));
    }
    if (filterRole) {
        filtered = filtered.filter(app => app.role.toLowerCase().includes(filterRole));
    }
    if (filterStatus) {
        filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Sort by deadline (ascending) for consistent display
    return filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
}

function renderApplicationsTable(appsToRender) {
    applicationsTableBody.innerHTML = ''; // Clear existing rows
    if (appsToRender.length === 0) {
        noApplicationsMessage.classList.remove('hidden');
    } else {
        noApplicationsMessage.classList.add('hidden');
        appsToRender.forEach(app => {
            const row = document.createElement('tr');
            const highlightClass = getDeadlineHighlight(app.deadline);
            row.className = `${highlightClass} hover:bg-gray-50 transition duration-100 ease-in-out`;

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${app.company}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${app.role}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${app.deadline}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select class="p-1 border border-gray-300 rounded-md bg-white text-sm focus:ring-indigo-500 focus:border-indigo-500" data-id="${app.id}">
                        <option value="Researching" ${app.status === 'Researching' ? 'selected' : ''}>Researching</option>
                        <option value="Interested" ${app.status === 'Interested' ? 'selected' : ''}>Interested</option>
                        <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                        <option value="Interviewed" ${app.status === 'Interviewed' ? 'selected' : ''}>Interviewed</option>
                        <option value="Offered" ${app.status === 'Offered' ? 'selected' : ''}>Offered</option>
                        <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="Pending Response" ${app.status === 'Pending Response' ? 'selected' : ''}>Pending Response</option>
                        <option value="Other" ${app.status === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-red-600 hover:text-red-900 ml-2 p-1 rounded-md hover:bg-red-100 transition duration-150 ease-in-out" data-id="${app.id}">
                        Delete
                    </button>
                </td>
            `;
            // Attach event listeners to dynamically created elements
            row.querySelector('select').addEventListener('change', (e) => {
                updateApplicationStatus(e.target.dataset.id, e.target.value);
            });
            row.querySelector('button').addEventListener('click', (e) => {
                deleteApplication(e.target.dataset.id);
            });
            applicationsTableBody.appendChild(row);
        });
    }
}

function getDeadlineHighlight(deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'bg-red-200'; // Past due
    } else if (diffDays === 0) {
        return 'bg-orange-200'; // Due today
    } else if (diffDays <= 7) {
        return 'bg-yellow-200'; // Within 7 days
    }
    return ''; // No special highlight
}

function renderAnalysisSections(allApplications) {
    const totalApps = allApplications.length;
    totalApplicationsCount.textContent = totalApps;

    // Status Distribution
    const statusCounts = {
        Applied: 0, Interviewed: 0, Offered: 0, Rejected: 0,
        'Pending Response': 0, Interested: 0, Researching: 0, Other: 0,
    };
    allApplications.forEach(app => {
        if (statusCounts.hasOwnProperty(app.status)) {
            statusCounts[app.status]++;
        } else {
            statusCounts['Other']++;
        }
    });

    statusDistributionChart.innerHTML = '';
    statusDistributionSummary.innerHTML = '';

    Object.entries(statusCounts).forEach(([status, count]) => {
        const percentage = totalApps > 0 ? ((count / totalApps) * 100).toFixed(1) : 0;
        const colorClass =
            status === 'Applied' ? 'bg-blue-500' :
            status === 'Interviewed' ? 'bg-green-500' :
            status === 'Offered' ? 'bg-purple-500' :
            status === 'Rejected' ? 'bg-red-500' :
            status === 'Interested' ? 'bg-indigo-300' :
            status === 'Researching' ? 'bg-gray-400' :
            'bg-gray-500';

        // Render chart bars
        statusDistributionChart.innerHTML += `
            <div class="flex items-center">
                <span class="w-36 text-gray-700 font-medium">${status}:</span>
                <div class="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div class="h-full rounded-full ${colorClass}" style="width: ${percentage}%;"></div>
                    <span class="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        ${count} (${percentage}%)
                    </span>
                </div>
            </div>
        `;

        // Render summary cards
        statusDistributionSummary.innerHTML += `
            <div class="flex flex-col items-center p-2 rounded-md bg-gray-100 shadow-sm">
                <span class="text-sm font-semibold text-gray-700">${status}</span>
                <span class="text-xl font-bold text-indigo-600">${count}</span>
            </div>
        `;
    });

    // Upcoming Deadlines
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = allApplications
        .filter(app => {
            const deadlineDate = new Date(app.deadline);
            deadlineDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    upcomingDeadlinesList.innerHTML = '';
    if (upcoming.length === 0) {
        noUpcomingDeadlinesMessage.classList.remove('hidden');
    } else {
        noUpcomingDeadlinesMessage.classList.add('hidden');
        upcoming.forEach(app => {
            upcomingDeadlinesList.innerHTML += `
                <li class="text-gray-700">
                    <span class="font-semibold">${app.company}</span> - ${app.role} (Deadline: ${app.deadline})
                </li>
            `;
        });
    }

    // Past Deadlines
    const past = allApplications
        .filter(app => {
            const deadlineDate = new Date(app.deadline);
            deadlineDate.setHours(0, 0, 0, 0);
            return deadlineDate < today;
        })
        .sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

    pastDeadlinesList.innerHTML = '';
    if (past.length === 0) {
        noPastDeadlinesMessage.classList.remove('hidden');
    } else {
        noPastDeadlinesMessage.classList.add('hidden');
        past.forEach(app => {
            pastDeadlinesList.innerHTML += `
                <li class="text-gray-700">
                    <span class="font-semibold">${app.company}</span> - ${app.role} (Deadline: ${app.deadline}, Status: ${app.status})
                </li>
            `;
        });
    }

    // Pending Applications
    const pending = allApplications
        .filter(app => ['Applied', 'Pending Response', 'Interested', 'Researching'].includes(app.status))
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    pendingApplicationsList.innerHTML = '';
    if (pending.length === 0) {
        noPendingApplicationsMessage.classList.remove('hidden');
    } else {
        noPendingApplicationsMessage.classList.add('hidden');
        pending.forEach(app => {
            pendingApplicationsList.innerHTML += `
                <li class="text-gray-700">
                    <span class="font-semibold">${app.company}</span> - ${app.role} (Status: ${app.status}, Deadline: ${app.deadline})
                </li>
            `;
        });
    }

    // Follow-up Reminders
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setHours(0, 0, 0, 0); // Normalize to start of day
    fiveDaysAgo.setDate(today.getDate() - 5);

    const followUp = allApplications
        .filter(app => {
            const appDate = new Date(app.deadline); // Using deadline as a proxy for last interaction date
            appDate.setHours(0, 0, 0, 0);
            return (
                app.status === 'Interviewed' &&
                appDate < fiveDaysAgo
            );
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    followUpRemindersList.innerHTML = '';
    if (followUp.length === 0) {
        noFollowUpRemindersMessage.classList.remove('hidden');
    } else {
        noFollowUpRemindersMessage.classList.add('hidden');
        followUp.forEach(app => {
            followUpRemindersList.innerHTML += `
                <li class="text-gray-700">
                    <span class="font-semibold">${app.company}</span> - ${app.role} (Status: ${app.status}, Deadline: ${app.deadline})
                </li>
            `;
        });
    }
}

// Voting System Variables
const VOTING_DURATION_MINUTES = 2;
let votes = {
    "Candidate A": 0,
    "Candidate B": 0,
    "Candidate C": 0
};
let votedIds = new Set();
let voterList = JSON.parse(localStorage.getItem('voterList')) || ["ABC123", "DEF456", "XYZ789", "JAY123", "jay123", "son123", "san123", "satya1"];
let retryCount = 0;
let votingEndTime = new Date().getTime() + VOTING_DURATION_MINUTES * 60 * 1000;

updateTimer();

// Timer
function updateTimer() {
    const now = new Date().getTime();
    const remaining = votingEndTime - now;

    if (remaining > 0) {
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((remaining % (1000 * 60)) / 1000);
        document.getElementById('timer').innerText = `Time remaining: ${mins}:${secs < 10 ? '0' + secs : secs}`;
        setTimeout(updateTimer, 1000);
    } else {
        handleVotingEnd();
    }
}

// Handle Voting End
function handleVotingEnd() {
    if (retryCount < 2 && checkTie()) {
        retryCount++;
        alert(`Tie detected! Voting resumes for 20 seconds (Attempt ${retryCount}/2).`);
        votingEndTime = new Date().getTime() + 20 * 1000;
        updateTimer();
    } else if (retryCount >= 2 && checkTie()) {
        alert("Max tie-break attempts reached. Exiting.");
        exitVoting();
    } else {
        showWinner();
        exitVoting();
    }
}

// Voter ID submission
function submitVoterId() {
    const voterId = document.getElementById('voterId').value.trim().toUpperCase();
    const status = document.getElementById('status');

    if (!validateVoterId(voterId)) {
        status.innerText = "Invalid ID format or not in the list.";
        status.style.color = "red";
        return;
    }
    if (votedIds.has(voterId)) {
        status.innerText = "This Voter ID has already voted.";
        status.style.color = "orange";
        return;
    }
    openVoteModal(voterId);
}

// Validate Voter ID
function validateVoterId(id) {
    return id.length === 6 && /\d/.test(id) && voterList.map(v => v.toUpperCase()).includes(id);
}

// Open Vote Modal
function openVoteModal(voterId) {
    document.getElementById('candidates').innerHTML = '';

    for (let candidate in votes) {
        const btn = document.createElement('button');
        btn.innerText = candidate;
        btn.onclick = () => castVote(candidate, voterId);
        document.getElementById('candidates').appendChild(btn);
    }

    document.getElementById('voteModal').style.display = 'block';
}

// Cast Vote
function castVote(candidate, voterId) {
    votes[candidate]++;
    votedIds.add(voterId);
    document.getElementById('voteModal').style.display = 'none';
    alert(`Your vote for ${candidate} has been recorded.`);
    updateStatus();
}

// Update vote status
function updateStatus() {
    const status = document.getElementById('status');
    status.innerHTML = Object.entries(votes).map(([c, v]) => `${c}: ${v} votes`).join('<br>');
    status.style.color = "green";
}

// Check for tie
function checkTie() {
    const maxVotes = Math.max(...Object.values(votes));
    const winners = Object.keys(votes).filter(c => votes[c] === maxVotes && maxVotes > 0);
    return winners.length > 1;
}

// Show Winner
function showWinner() {
    const maxVotes = Math.max(...Object.values(votes));
    const winners = Object.keys(votes).filter(c => votes[c] === maxVotes && maxVotes > 0);

    if (winners.length === 1) {
        alert(`Winner: ${winners[0]} with ${maxVotes} votes.`);
    } else if (winners.length > 1) {
        alert(`It's a tie between: ${winners.join(", ")}`);
    } else {
        alert("No votes cast. No winner.");
    }
}

// Exit Voting
function exitVoting() {
    resetVoting();
    window.location.reload();
}

// Reset Voting Data
function resetVoting() {
    votes = {
        "Candidate A": 0,
        "Candidate B": 0,
        "Candidate C": 0
    };
    votedIds.clear();
}

// Open Add Voter ID Modal
function openAddVoterId() {
    document.getElementById('addVoterModal').style.display = 'block';
}

// Close Modals
function closeVoteModal() {
    document.getElementById('voteModal').style.display = 'none';
}
function closeAddVoterModal() {
    document.getElementById('addVoterModal').style.display = 'none';
}

// Add New Voter ID
function addNewVoterId() {
    const newId = document.getElementById('newVoterId').value.trim().toUpperCase();

    if (newId.length !== 6 || !/\d/.test(newId)) {
        alert("Invalid ID. Must be 6 characters including a digit.");
        return;
    }
    if (voterList.map(v => v.toUpperCase()).includes(newId)) {
        alert("This ID already exists.");
        return;
    }
    voterList.push(newId);
    localStorage.setItem('voterList', JSON.stringify(voterList));
    alert(`Voter ID '${newId}' added successfully.`);
    closeAddVoterModal();
}

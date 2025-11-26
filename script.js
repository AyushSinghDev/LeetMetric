document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsSection = document.getElementById("stats-section");
    const errorMessage = document.getElementById("error-message");
    const cardStatsContainer = document.getElementById("card-stats-container");
    const extraInfo = document.getElementById("extra-info");
    const easyCircle = document.getElementById("easy-circle");
    const mediumCircle = document.getElementById("medium-circle");
    const hardCircle = document.getElementById("hard-circle");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");

    function validateUsername(username) {
        if (username.trim() === "") {
            showError("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,25}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            showError("Invalid Username format");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            statsSection.classList.add("hidden");
            errorMessage.textContent = "";

            extraInfo.classList.remove("hidden");

            const statsUrl = `https://leetcode-stats-api.herokuapp.com/${username}`;
            const contestUrl = `https://alfa-leetcode-api.onrender.com/${username}/contest`;
            
            const [statsRes, contestRes] = await Promise.all([
                fetch(statsUrl),
                fetch(contestUrl)
            ]);

            if (!statsRes.ok) {
                throw new Error("Unable to fetch user details");
            }

            const statsData = await statsRes.json();
            
            let contestData = null;
            if(contestRes.ok) {
                contestData = await contestRes.json();
            }

            if(statsData.status === "error"){
                throw new Error("User not found");
            }

            displayUserDetails(statsData, contestData);

        } catch (error) {
            showError(error.message);
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        statsSection.classList.add("hidden");
        extraInfo.classList.remove("hidden");
    }

    function displayUserDetails(statsData, contestData) {
        errorMessage.textContent = "";
        
        extraInfo.classList.add("hidden");
        
        statsSection.classList.remove("hidden");

        const totalEasy = statsData.totalEasy;
        const totalMedium = statsData.totalMedium;
        const totalHard = statsData.totalHard;

        const solvedEasy = statsData.easySolved;
        const solvedMedium = statsData.mediumSolved;
        const solvedHard = statsData.hardSolved;

        const easyPercent = totalEasy === 0 ? 0 : (solvedEasy / totalEasy) * 100;
        const mediumPercent = totalMedium === 0 ? 0 : (solvedMedium / totalMedium) * 100;
        const hardPercent = totalHard === 0 ? 0 : (solvedHard / totalHard) * 100;

        easyLabel.textContent = solvedEasy;
        mediumLabel.textContent = solvedMedium;
        hardLabel.textContent = solvedHard;

        animateProgress(easyCircle, easyPercent, '#00b8a3'); 
        animateProgress(mediumCircle, mediumPercent, '#ffc01e');
        animateProgress(hardCircle, hardPercent, '#ff375f');

        const contestRating = (contestData && contestData.contestRating) 
                                ? Math.round(contestData.contestRating) 
                                : 0;

        const cardsData = [
            { label: "Total Solved", value: `${statsData.totalSolved} / ${statsData.totalQuestions}` },
            { label: "Acceptance Rate", value: `${statsData.acceptanceRate}%` },
            { label: "Ranking", value: statsData.ranking },
            { label: "Contest Rating", value: contestRating }
        ];

        cardStatsContainer.innerHTML = cardsData.map(card => `
            <div class="card">
                <h4>${card.label}</h4>
                <p>${card.value}</p>
            </div>
        `).join("");
    }

    function animateProgress(circleElement, targetPercentage, color) {
        let currentProgress = 0;
        const speed = 15;
        
        if(circleElement.dataset.animationId) {
            clearInterval(circleElement.dataset.animationId);
        }

        const interval = setInterval(() => {
            currentProgress++;
            if (currentProgress > targetPercentage) {
                currentProgress = targetPercentage;
                clearInterval(interval);
            }
            circleElement.style.background = `conic-gradient(${color} ${currentProgress * 3.6}deg, #30363d 0deg)`;
        }, speed);
        
        circleElement.dataset.animationId = interval;
    }

    searchButton.addEventListener('click', function () {
        const username = usernameInput.value;
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });

    usernameInput.addEventListener('keypress', function(e){
        if(e.key === 'Enter'){
            const username = usernameInput.value;
            if (validateUsername(username)) {
                fetchUserDetails(username);
            }
        }
    });
});
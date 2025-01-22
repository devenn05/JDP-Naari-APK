document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.style.scrollBehavior = 'auto';

    window.scrollTo(0, 0);

    setTimeout(function() {
        document.documentElement.style.scrollBehavior = 'smooth';
    }, 100);

    // Scrollbar gradient reversal
    let lastScrollTop = 0;
    let isScrollingDown = true;

    window.addEventListener('scroll', function() {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > lastScrollTop) {
            // Scrolling down
            if (!isScrollingDown) {
                document.styleSheets[0].addRule('::-webkit-scrollbar-thumb', 'background: linear-gradient(to bottom, black, grey);');
                isScrollingDown = true;
            }
        } else {
            // Scrolling up
            if (isScrollingDown) {
                document.styleSheets[0].addRule('::-webkit-scrollbar-thumb', 'background: linear-gradient(to top, black, grey);');
                isScrollingDown = false;
            }
        }
        lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
    }, false);

    // Alarm functionality
    const modal = document.getElementById("popupModal");
    const btn = document.getElementById("addAlarmButton");
    const span = document.getElementsByClassName("close")[0];
    const currentTime = document.querySelector(".wrapper h1");
    const content = document.querySelector(".clock-content");
    const selectMenu = document.querySelectorAll("select");
    const setAlarmBtn = document.querySelector(".wrapper button");
    const alarmStatusDiv = document.getElementById('alarmStatus');
    const stopAlarmBtn = document.getElementById('stopAlarmButton');

    let alarmTime, isAlarmSet = false;
    let isRingtonePlaying = false;

    btn.onclick = function() {
        modal.style.display = "block";
        updateSetAlarmButtonText();
    }

    span.onclick = function() {
        closeModal();
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    function closeModal() {
        modal.style.display = "none";
        selectMenu.forEach(select => select.selectedIndex = 0);
    }

    for (let i = 12; i > 0; i--) {
        i = i < 10 ? "0" + i : i;
        let option = `<option value="${i}">${i}</option>`;
        selectMenu[0].firstElementChild.insertAdjacentHTML("afterend", option);
    }

    for (let i = 59; i >= 0; i--) {
        i = i < 10 ? "0" + i : i;
        let option = `<option value="${i}">${i}</option>`;
        selectMenu[1].firstElementChild.insertAdjacentHTML("afterend", option);
    }

    for (let i = 2; i > 0; i--) {
        let ampm = i == 1 ? "AM" : "PM";
        let option = `<option value="${ampm}">${ampm}</option>`;
        selectMenu[2].firstElementChild.insertAdjacentHTML("afterend", option);
    }

    setInterval(() => {
        let date = new Date(),
        h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds(),
        ampm = "AM";

        if (h >= 12) {
            h = h - 12;
            ampm = "PM";
        }

        h = h == 0 ? h = 12 : h;
        h = h < 10 ? "0" + h : h;
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;

        currentTime.innerText = `${h}:${m}:${s} ${ampm}`;

        if (s === '59') {
            setTimeout(() => {
                if (alarmTime == `${h}:${m} ${ampm}` && !isRingtonePlaying) {
                    playRingtone();
                }
            }, 900);
        } else if (alarmTime == `${h}:${m} ${ampm}` && s === '00' && !isRingtonePlaying) {
            playRingtone();
        }
    }, 1000);

    function playRingtone() {
        Android.playRingtone();
        isRingtonePlaying = true;
        stopAlarmBtn.style.display = 'block';
    }

    function stopRingtone() {
        Android.stopRingtone();
        isRingtonePlaying = false;
        stopAlarmBtn.style.display = 'none';
    }

    function setAlarm() {
        if (isAlarmSet) {
            alarmTime = "";
            stopRingtone();
            content.classList.remove("disable");
            isAlarmSet = false;
            updateSetAlarmButtonText();
            updateAlarmStatus();
            stopAlarmBtn.style.display = 'none';
        } else {
            let time = `${selectMenu[0].value}:${selectMenu[1].value} ${selectMenu[2].value}`;
            if (time.includes("Hour") || time.includes("Minute") || time.includes("AM/PM")) {
                return alert("Please, select a valid time to set Alarm!");
            }

            alarmTime = time;
            isAlarmSet = true;
            content.classList.add("disable");
            updateSetAlarmButtonText();
            updateAlarmStatus();
        }
        closeModal();
    }

    function updateSetAlarmButtonText() {
        setAlarmBtn.innerText = isAlarmSet ? "Clear Alarm" : "Set Alarm";
    }

    function updateAlarmStatus() {
        if (isAlarmSet) {
            alarmStatusDiv.textContent = "Alarm set for " + alarmTime;
        } else {
            alarmStatusDiv.textContent = "";
        }
    }

    setAlarmBtn.addEventListener("click", setAlarm);

    stopAlarmBtn.addEventListener("click", stopRingtone);

    // Stopwatch functionality
    let stopwatchSeconds = 0;
    let stopwatchTens = 0;
    let stopwatchMins = 0;
    let getStopwatchSeconds = document.querySelector('.stopwatch-seconds');
    let getStopwatchTens = document.querySelector('.stopwatch-tens');
    let getStopwatchMins = document.querySelector('.stopwatch-mins');
    let btnStopwatchStart = document.querySelector('.stopwatch-btn-start');
    let btnStopwatchStop = document.querySelector('.stopwatch-btn-stop');
    let btnStopwatchReset = document.querySelector('.stopwatch-btn-reset');
    let stopwatchRunning = false;
    let stopwatchStartTime;
    let stopwatchElapsedTime = 0;

    function updateStopwatch() {
        if (stopwatchRunning) {
            const currentTime = performance.now();
            const deltaTime = currentTime - stopwatchStartTime;
            const totalMilliseconds = stopwatchElapsedTime + deltaTime;

            stopwatchTens = Math.floor((totalMilliseconds % 1000) / 10);
            stopwatchSeconds = Math.floor((totalMilliseconds / 1000) % 60);
            stopwatchMins = Math.floor((totalMilliseconds / 1000 / 60) % 60);

            getStopwatchTens.innerHTML = stopwatchTens.toString().padStart(2, '0');
            getStopwatchSeconds.innerHTML = stopwatchSeconds.toString().padStart(2, '0');
            getStopwatchMins.innerHTML = stopwatchMins.toString().padStart(2, '0');

            requestAnimationFrame(updateStopwatch);
        }
    }

    btnStopwatchStart.addEventListener('click', () => {
        if (!stopwatchRunning) {
            stopwatchRunning = true;
            stopwatchStartTime = performance.now();
            requestAnimationFrame(updateStopwatch);
        }
    });

    btnStopwatchStop.addEventListener('click', () => {
        if (stopwatchRunning) {
            stopwatchRunning = false;
            stopwatchElapsedTime += performance.now() - stopwatchStartTime;
        }
    });

    btnStopwatchReset.addEventListener('click', () => {
        stopwatchRunning = false;
        stopwatchElapsedTime = 0;
        stopwatchTens = 0;
        stopwatchSeconds = 0;
        stopwatchMins = 0;
        getStopwatchTens.innerHTML = '00';
        getStopwatchSeconds.innerHTML = '00';
        getStopwatchMins.innerHTML = '00';
    });

    // Timer functionality
    const hoursSelect = document.getElementById('hours');
    const minutesSelect = document.getElementById('minutes');
    const secondsSelect = document.getElementById('seconds');
    const timerDisplay = document.getElementById('timer-display');
    const startButton = document.getElementById('start-timer');
    const resetButton = document.getElementById('reset-timer');
    let timerInterval;
    let totalSeconds = 0;

    for (let i = 0; i <= 24; i++) {
        hoursSelect.options.add(new Option(i.toString().padStart(2, '0'), i));
    }
    for (let i = 0; i <= 59; i++) {
        minutesSelect.options.add(new Option(i.toString().padStart(2, '0'), i));
        secondsSelect.options.add(new Option(i.toString().padStart(2, '0'), i));
    }

    function updateDisplay() {
        const hours = parseInt(hoursSelect.value) || 0;
        const minutes = parseInt(minutesSelect.value) || 0;
        const seconds = parseInt(secondsSelect.value) || 0;
        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        totalSeconds = (parseInt(hoursSelect.value) || 0) * 3600 +
                       (parseInt(minutesSelect.value) || 0) * 60 +
                       (parseInt(secondsSelect.value) || 0);
        updateDisplay();

        if (totalSeconds > 0) {
            timerInterval = setInterval(() => {
                if (totalSeconds > 0) {
                    totalSeconds--;
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;
                    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                    if (totalSeconds === 1) {
                        setTimeout(() => {
                            playRingtone();
                        }, 900);
                    }
                } else {
                    clearInterval(timerInterval);
                    updateDisplay();
                }
            }, 1000);
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        totalSeconds = 0;
        hoursSelect.selectedIndex = 0;
        minutesSelect.selectedIndex = 0;
        secondsSelect.selectedIndex = 0;
        updateDisplay();
        stopRingtone();
    }

    hoursSelect.addEventListener('change', updateDisplay);
    minutesSelect.addEventListener('change', updateDisplay);
    secondsSelect.addEventListener('change', updateDisplay);

    startButton.addEventListener('click', startTimer);
    resetButton.addEventListener('click', resetTimer);

    updateDisplay();

    // Event listeners for header links
    const headerLinks = document.querySelectorAll('#header a');

    headerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                closeModal();
            }
        });
    });
});
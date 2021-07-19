const {ipcRenderer} = require('electron');
const {Rive} = require('rive-js');
let allUpdatedDate = localStorage.getItem('all-date') != null ? JSON.parse(localStorage.getItem('all-date')) : null;
let coronaUpdatedDate = localStorage.getItem('corona-date') != null ? JSON.parse(localStorage.getItem('corona-date')) : null;
let weatherUpdatedDate = localStorage.getItem('weather-date') != null ? JSON.parse(localStorage.getItem('weather-date')) : null;
let currencyUpdatedDate = localStorage.getItem('currency-date') != null ? JSON.parse(localStorage.getItem('currency-date')) : null;
let prayerUpdatedDate = localStorage.getItem('prayer-date') != null ? JSON.parse(localStorage.getItem('prayer-date')) : null;
let footballUpdatedDate = localStorage.getItem('football-date') != null ? JSON.parse(localStorage.getItem('football-date')) : null;
let dstLocation = localStorage.getItem('location');
const rive = new Rive({
    src: '../assets/mosque.riv',
    canvas: document.getElementById('mosque-riv'),
    autoplay: true,
    animations: 'anime',
    onstop: event => {
        rive.play('anime', true);
    },
});
const rive1 = new Rive({
    src: '../assets/ball.riv',
    canvas: document.getElementById('football-riv'),
    autoplay: true,
    animations: 'anime',
    onstop: event => {
        rive1.play('anime', true);
    },
});
setUpdatedDate(UpdateType.ALL, allUpdatedDate);
setUpdatedDate(UpdateType.PRAYER, prayerUpdatedDate);
setUpdatedDate(UpdateType.CORONA, coronaUpdatedDate);
setUpdatedDate(UpdateType.CURRENCY, currencyUpdatedDate);
setUpdatedDate(UpdateType.WEATHER, weatherUpdatedDate);
setUpdatedDate(UpdateType.FOOTBALL, footballUpdatedDate);
let coronaLock = false,
    weatherLock = false,
    currencyLock = false,
    prayerLock = false,
    footballLock = false,
    allLock = false;

function minimizeWindow() {
    ipcRenderer.send('minimize-window');
}

function openAboutWindow() {
    ipcRenderer.send('open-about-window');
}

function exitWindow() {
    ipcRenderer.send('exit-window');
}

async function updateCorona(btn) {
    if (!(await checkInternet())) {
        showSnackbarWithType('لا يوجد إتصال بالإنترنت', SnackbarType.WRONG);
        return;
    }
    if (!coronaLock) {
        coronaLock = true;
        toggleButtonLoader(btn);
        try {
            const data = await getCoronaData();
            storeDataIntoJson(JSON.stringify(data), 'corona');
            setUpdatedDate(UpdateType.CORONA, new moment());
        } catch (e) {
            writeLog(e);
            showSnackbarWithType('خطأ فى تحديث الكورونا', SnackbarType.WRONG);
        }
        toggleButtonLoader(btn);
        coronaLock = false;
    }
}

async function updateWeather(btn) {
    if (!(await checkInternet())) {
        showSnackbarWithType('لا يوجد إتصال بالإنترنت', SnackbarType.WRONG);
        return;
    }
    if (!weatherLock) {
        weatherLock = true;
        toggleButtonLoader(btn);
        try {
            const data = await getWeatherData();
            storeDataIntoJson(JSON.stringify(data), 'weather');
            setUpdatedDate(UpdateType.WEATHER, new moment());
        } catch (e) {
            writeLog(e);
            showSnackbarWithType('خطأ فى تحديث الطقس', SnackbarType.WRONG);
        }
        toggleButtonLoader(btn);
        weatherLock = false;
    }
}

async function updateCurrency(btn) {
    if (!(await checkInternet())) {
        showSnackbarWithType('لا يوجد إتصال بالإنترنت', SnackbarType.WRONG);
        return;
    }
    if (!currencyLock) {
        currencyLock = true;
        toggleButtonLoader(btn);
        try {
            const data = await getCurrencyData();
            storeDataIntoJson(JSON.stringify(data), 'currency');
            setUpdatedDate(UpdateType.CURRENCY, new moment());
        } catch (e) {
            writeLog(e);
            showSnackbarWithType('خطأ فى تحديث أسعار العملات', SnackbarType.WRONG);
        }
        toggleButtonLoader(btn);
        currencyLock = false;
    }
}

async function updatePrayer(btn) {
    if (!(await checkInternet())) {
        showSnackbarWithType('لا يوجد إتصال بالإنترنت', SnackbarType.WRONG);
        return;
    }
    if (!prayerLock) {
        prayerLock = true;
        toggleButtonLoader(btn);
        try {
            const data = await getPrayerData();
            storeDataIntoJson(JSON.stringify(data), 'prayer');
            setUpdatedDate(UpdateType.PRAYER, new moment());
        } catch (e) {
            writeLog(e);
            showSnackbarWithType('خطأ فى تحديث مواقيت الصلاة', SnackbarType.WRONG);
        }
        toggleButtonLoader(btn);
        prayerLock = false;
    }
}

async function updateFootball(btn) {
    if (!(await checkInternet())) {
        showSnackbarWithType('لا يوجد إتصال بالإنترنت', SnackbarType.WRONG);
        return;
    }
    if (!footballLock) {
        footballLock = true;
        toggleButtonLoader(btn);
        try {
            const todayData = await getFootballData();
            const tomorrowData = await getFootballData(moment().add({day: 1}).format('M/DD/YYYY'));
            storeDataIntoJson(JSON.stringify({
                today: todayData,
                tomorrow: tomorrowData,
            }), 'football');
            setUpdatedDate(UpdateType.FOOTBALL, new moment());
        } catch (e) {
            console.log(e);
            writeLog(e);
            showSnackbarWithType('خطأ فى تحديث مباريات اليوم', SnackbarType.WRONG);
        }
        toggleButtonLoader(btn);
        footballLock = false;
    }
}

async function updateAllData(btn) {
    if (!(await checkInternet())) {
        showSnackbarWithType('لا يوجد إتصال بالإنترنت', SnackbarType.WRONG);
        return;
    }
    if (coronaLock || weatherLock || currencyLock || prayerLock || footballLock) {
        showSnackbarWithType('هناك تحديث قيد التشغيل الآن، إنتظر حتى الإنتهاء');
        return;
    }
    if (!allLock) {
        allLock = true;
        toggleButtonLoader(btn);
        updateCorona(document.getElementById('corona-update-btn')).then(value => {
            if (!coronaLock && !weatherLock && !currencyLock && !prayerLock && !footballLock) {
                setUpdatedDate(UpdateType.ALL, new moment());
                showSnackbarWithType('تم تحديث الكل', SnackbarType.SUCCESS);
                toggleButtonLoader(btn);
                allLock = false;
            }
        });
        updateWeather(document.getElementById('weather-update-btn')).then(value => {
            if (!coronaLock && !weatherLock && !currencyLock && !prayerLock && !footballLock) {
                setUpdatedDate(UpdateType.ALL, new moment());
                showSnackbarWithType('تم تحديث الكل', SnackbarType.SUCCESS);
                toggleButtonLoader(btn);
                allLock = false;
            }
        });
        updateCurrency(document.getElementById('currency-update-btn')).then(value => {
            if (!coronaLock && !weatherLock && !currencyLock && !prayerLock && !footballLock) {
                setUpdatedDate(UpdateType.ALL, new moment());
                showSnackbarWithType('تم تحديث الكل', SnackbarType.SUCCESS);
                toggleButtonLoader(btn);
                allLock = false;
            }
        });
        updatePrayer(document.getElementById('prayer-update-btn')).then(value => {
            if (!coronaLock && !weatherLock && !currencyLock && !prayerLock && !footballLock) {
                setUpdatedDate(UpdateType.ALL, new moment());
                showSnackbarWithType('تم تحديث الكل', SnackbarType.SUCCESS);
                toggleButtonLoader(btn);
                allLock = false;
            }
        });
        updateFootball(document.getElementById('football-update-btn')).then(value => {
            if (!coronaLock && !weatherLock && !currencyLock && !prayerLock && !footballLock) {
                setUpdatedDate(UpdateType.ALL, new moment());
                showSnackbarWithType('تم تحديث الكل', SnackbarType.SUCCESS);
                toggleButtonLoader(btn);
                allLock = false;
            }
        });
    }
}

const path = document.getElementById('path-input');
dstLocation && (path.value = dstLocation);

function sendData(btn) {
    toggleButtonLoader(btn);
    if (path.value != null && path.value !== '') {
        const result = sendCopyOfDataToViewApp(path.value);
        if (result) {
            showSnackbarWithType('تم إرسال البيانات للمسار المحدد', SnackbarType.SUCCESS);
            localStorage.setItem('location', path.value);
        }
    } else {
        showSnackbarWithType('أدخل المسار ثم حاول مرة أخري', SnackbarType.WRONG);
    }
    toggleButtonLoader(btn);
}

function developerToast() {
    showSnackbarWithType('Developed By: Ma7MOoOD SHaRaF');
}
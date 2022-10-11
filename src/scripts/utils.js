const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const connectivity = require('connectivity');
let darkMode = localStorage.getItem('lands_c_darkMode');
const darkModeToggle = document.querySelector('#dark-mode-toggle');
const enableDarkMode = () => {
    const btn = document.getElementById('dark-mode-btn-img');
    btn && (btn.src = '../assets/sun.png');
    document.body.classList.add('dark-mode');
    localStorage.setItem('lands_c_darkMode', 'enabled');
};
const disableDarkMode = () => {
    const btn = document.getElementById('dark-mode-btn-img');
    btn && (btn.src = '../assets/moon.png');
    document.body.classList.remove('dark-mode');
    localStorage.setItem('lands_c_darkMode', null);
};
if (darkMode === 'enabled') {
    enableDarkMode();
    const btn = document.getElementById('dark-mode-btn-img');
    btn && (btn.src = '../assets/sun.png');
} else {
    disableDarkMode();
    const btn = document.getElementById('dark-mode-btn-img');
    btn && (btn.src = '../assets/moon.png');
}
darkModeToggle && darkModeToggle.addEventListener('click', () => {
    darkMode = localStorage.getItem('lands_c_darkMode');
    if (darkMode !== 'enabled') {
        enableDarkMode();
        document.getElementById('dark-mode-btn-img').src = '../assets/sun.png';
    } else {
        disableDarkMode();
        document.getElementById('dark-mode-btn-img').src = '../assets/moon.png';
    }
});
const SnackbarType = {
    SUCCESS: 'success',
    WRONG: 'wrong',
}

function checkInternet() {
    return new Promise((resolve) => {
        connectivity(function (online) {
            if (online) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    })
}

function showSnackbarWithType(msg, sType) {
    const bar = document.getElementById("snackbar");
    bar.classList.contains('show') && (bar.classList.remove('show'));
    bar.innerHTML = `${sType ? `<img src=${sType === SnackbarType.SUCCESS ? "../assets/correct.png" : "../assets/wrong.png"} alt="">` : ''} ${msg}`;
    bar.classList.add('show');
    setTimeout(() => bar.classList.remove('show'), 3000);
}

function toggleButtonLoader(button) {
    button.classList.toggle('active');
}

function storeDataIntoJson(data, filename) {
    if (!fs.existsSync(`data`))
        fs.mkdirSync('data');
    fs.writeFileSync(`data/${filename}.json`, data, {
        encoding: 'utf8'
    });
}

async function getCoronaData() {
    const data = {};
    const egData = await axios.get('https://disease.sh/v3/covid-19/countries/egypt?yesterday=true&strict=true');
    const egLastData = await axios.get('https://disease.sh/v3/covid-19/historical/Egypt?lastdays=5');
    const worldData = await axios.get('https://disease.sh/v3/covid-19/all?yesterday=true');
    const countriesData = await axios.get('https://disease.sh/v3/covid-19/countries?yesterday=true&sort=cases');
    data.egypt = {
        updated: egData.data['updated'],
        cases: egData.data['cases'],
        recovered: egData.data['recovered'],
        deaths: egData.data['deaths'],
        todayCases: egData.data['todayCases'],
        todayDeaths: egData.data['todayDeaths'],
        todayRecovered: egData.data['todayRecovered'],
    };
    data.egyptTimeline = egLastData.data['timeline'];
    data.world = {
        updated: worldData.data['updated'],
        cases: worldData.data['cases'],
        todayCases: worldData.data['todayCases'],
        recovered: worldData.data['recovered'],
        todayRecovered: worldData.data['todayRecovered'],
        deaths: worldData.data['deaths'],
        todayDeaths: worldData.data['todayDeaths'],
    };
    data.countries = [];
    for (const country of countriesData.data) {
        data.countries.push({
            updated: country['updated'],
            countryName: countriesName[country['country']] ?? country['country'],
            cases: country['cases'],
            recovered: country['recovered'],
            deaths: country['deaths'],
        });
        if (data.countries.length === 5)
            break;
    }
    return data;
}

async function getWeatherData() {
    const data = [];
    const weatherData = await axios.get('https://api.openweathermap.org/data/2.5/onecall?lat=30.050225&lon=31.340898&appid=639862907b4ca4285a208d2158bcf785&lang=ar&units=metric&exclude=current,minutely,hourly');
    for (const day of weatherData.data['daily']) {
        data.push({
            dt: day['dt'],
            sunrise: day['sunrise'],
            sunset: day['sunset'],
            temp: day['temp'],
            humidity: day['humidity'],
            weather: day['weather'],
        });
    }
    return data;
}

async function getCurrencyData() {
    const convertCurrency = (value) => Math.round(((1 / value) + Number.EPSILON) * 100) / 100;
    const currencyData = await axios.get('https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/egp.json');
    return {
        date: currencyData.data['date'],
        aed: {
            name: 'الدرهم إماراتي',
            value: convertCurrency(currencyData.data['egp']['aed']),
        },
        usd: {
            name: 'الدولار الأمريكي',
            value: convertCurrency(currencyData.data['egp']['usd']),
        },
        gbp: {
            name: 'الجنية الإسترليني',
            value: convertCurrency(currencyData.data['egp']['gbp']),
        },
        eur: {
            name: 'اليورو',
            value: convertCurrency(currencyData.data['egp']['eur']),
        },
        kwd: {
            name: 'الدينار الكويتي',
            value: convertCurrency(currencyData.data['egp']['kwd']),
        },
        sar: {
            name: 'الريال السعودي',
            value: convertCurrency(currencyData.data['egp']['sar']),
        },
        jpy: {
            name: 'الين الياباني',
            value: convertCurrency(currencyData.data['egp']['jpy']),
        },
    };
}

function getPrayerDataAlternative() {
    const adhan = require('adhan');
    const coordinates = new adhan.Coordinates(30.047272, 31.325525);
    const params = adhan.CalculationMethod.Egyptian();
    const prayerTimes = new adhan.PrayerTimes(coordinates, new Date(), params);
    return {
        times: {
            Fajr: moment(prayerTimes.fajr).format('HH:mm'),
            Dhuhr: moment(prayerTimes.dhuhr).format('HH:mm'),
            Asr: moment(prayerTimes.asr).format('HH:mm'),
            Maghrib: moment(prayerTimes.maghrib).format('HH:mm'),
            Isha: moment(prayerTimes.isha).format('HH:mm'),
        }
    };
}

async function getFootballData(date) {
    console.log(date);
    const data = await axios.get('https://www.yallakora.com/match-center' + (date ? `?date=${date}` : ''));
    const page = document.createElement('html');
    page.innerHTML = data.data;
    const footballData = [];
    const day = page.querySelector('#day');
    if (!day.querySelectorAll('.noStatsDiv').length) {
        const all = day.querySelector('.cd-gallery').querySelector('.mtchCntrContainer');
        for (const matchItem of all.querySelectorAll('.matchItem')) {
            const obj = {
                leagueName: matchItem.querySelector('.ttl').querySelector('h2').querySelector('a').innerText,
                fixtures: [],
            };
            for (const matchX of matchItem.querySelector('.mtchObjContainer').querySelectorAll('.matchObj')) {
                obj.fixtures.push({
                    team1: matchX.querySelector('.teamA').querySelector('.teamName').innerText.trim(),
                    time: moment(matchX.querySelector('.resultDiv').querySelector('.matchTime').innerText.trim(), 'HH:mm').format('h:mm'),
                    team2: matchX.querySelector('.teamB').querySelector('.teamName').innerText.trim(),
                })
            }
            obj.fixtures.length && footballData.push(obj);
        }
    }
    return footballData;
}

async function getPrayerData(date) {
    const data = await axios.get('https://athantimes.com/Egypt');
    const page = document.createElement('html');
    page.innerHTML = data.data;
    const salat = page.querySelector('#salat');
    if (salat) {
        const table = salat.querySelector('table').querySelector('tbody');
        if (table) {
            const rows = table.querySelectorAll('tr');
            console.log(rows);
            return {
                times: {
                    Fajr: rows[0].querySelector('td').innerText,
                    Dhuhr: rows[1].querySelector('td').innerText,
                    Asr: rows[2].querySelector('td').innerText,
                    Maghrib: rows[3].querySelector('td').innerText,
                    Isha: rows[4].querySelector('td').innerText,
                }
            };
        }
    }
    return getPrayerDataAlternative();
}

const UpdateType = {
    CORONA: 'CORONA',
    WEATHER: 'WEATHER',
    CURRENCY: 'CURRENCY',
    PRAYER: 'PRAYER',
    FOOTBALL: 'FOOTBALL',
    ALL: 'ALL'
}

function setUpdatedDate(type, date) {
    const text = date ? `أخر تحديث: ${new moment(date).format("DD/MM/YYYY hh:mm A")}` : 'لا يوجد تحديث حتى الآن';
    switch (type) {
        case UpdateType.ALL:
            document.getElementById('all-date').innerText = text;
            localStorage.setItem('all-date', JSON.stringify(date));
            break;
        case UpdateType.CORONA:
            document.getElementById('corona-date').innerText = text;
            localStorage.setItem('corona-date', JSON.stringify(date));
            break;
        case UpdateType.WEATHER:
            document.getElementById('weather-date').innerText = text;
            localStorage.setItem('weather-date', JSON.stringify(date));
            break;
        case UpdateType.CURRENCY:
            document.getElementById('currency-date').innerText = text;
            localStorage.setItem('currency-date', JSON.stringify(date));
            break;
        case UpdateType.PRAYER:
            document.getElementById('prayer-date').innerText = text;
            localStorage.setItem('prayer-date', JSON.stringify(date));
            break;
        case UpdateType.FOOTBALL:
            document.getElementById('football-date').innerText = text;
            localStorage.setItem('football-date', JSON.stringify(date));
            break;
    }
}

function sendCopyOfDataToViewApp(path) {
    try {
        if (!fs.existsSync(path))
            fs.mkdirSync(path, {recursive: true});
        fs.copyFileSync('data/corona.json', `${path}/corona.json`);
        fs.copyFileSync('data/currency.json', `${path}/currency.json`);
        fs.copyFileSync('data/prayer.json', `${path}/prayer.json`);
        fs.copyFileSync('data/weather.json', `${path}/weather.json`);
        fs.copyFileSync('data/football.json', `${path}/football.json`);
        return true;
    } catch (e) {
        if (e.message.indexOf('no such file or directory') >= 0)
            showSnackbarWithType('المسار غير موجود', SnackbarType.WRONG);
        else
            showSnackbarWithType('خطأ فى إرسال البيانات', SnackbarType.WRONG);
        writeLog(e);
    }
}

function writeLog(text) {
    try {
        fs.appendFileSync('log.txt', `-------------- ${moment().format('DD/MM/YYYY HH:mm A')} --------------\r\n${text}\r\n`);
    } catch (e) {
        console.log(e);
    }
}

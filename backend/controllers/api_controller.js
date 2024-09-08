const google = require('./google');


exports.index = (req, res, next) => {
    console.log('connected node.js');
    res.redirect(302, '/');
}

exports.googleLogin = async (req, res, next) => {
    console.log('google login')
    await google.googleLogin(req, res);
}

exports.getSekouEvents = async (req, res, next) => {
    const files = await google.getAllFilesFromGDrive();
    const tartgetDate = new Date(req.body.date);
    const year = tartgetDate.getFullYear().toString().slice(-2);
    const month = (tartgetDate.getMonth() + 1);
    const fileName = year + '　' + month + '月キャストシフト';
    const targetFile = files.filter(file => file.name == fileName);
    if (targetFile) {
        console.log('found file ' + fileName);
    }
    const sekouEvents = await google.getSekouEvents(targetFile[0].id);
    res.json(sekouEvents);
}

exports.kintaiSubmit = async (req, res, next) => {
    const files = await google.getAllFilesFromGDrive();
    const date = new Date(req.body.date);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1);
    const fileName = year + '　' + month + '月キャストシフト提出';
    const email = req.body.email;
    const userName = req.body.userName;
    const events = JSON.parse(req.body.events);
    var fileId;
    if (!files.some(file => file.name == fileName)) {
        console.log(fileName + " not found, will create");
        fileId = await google.createNewSpreadSheet(year, month);
        await google.createHeader(fileId, date);
    } else {
        console.log("found " + fileName);
        const file = files.filter(file => file.name == fileName);
        fileId = file[0].id;
    }
    const lastLine = await google.getLastLine(fileId);
    const timeStamp = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000)).toLocaleString('sv-SE');
    const values = [[timeStamp, email, userName]]; 
    events.map(event => {
        values[0].push(event.title);
        values[0].push(event.extendedProps.description);
    })
    values[0].push(req.body.comment);
    await google.inputSpreadsheet(fileId, 'A' + (lastLine + 1), values);
    await res.end();
}

exports.isSubmitted = async (req, res, next) => {
    const files = await google.getAllFilesFromGDrive();
    const date = new Date(req.body.date);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1);
    const fileName = year + '　' + month + '月キャストシフト提出';
    if (!files.some(file => file.name == fileName)) {
        res.json(false);
        return;
    }
    const file = files.filter(file => file.name === fileName);
    const fileId = file[0].id;
    const emailList = await google.getSubmittedEmailList(fileId);
    const isSubmitted = emailList.some(email => email == req.body.email);
    const message = isSubmitted? 'Already submitted': 'Not submitted yet'
    console.log(message);
    res.json(isSubmitted);
}

const getYearMonth = (date) => {
    const newDate = new Date(date);
    const year = newDate.getFullYear().toString().slice(-2);
    const month = (newDate.getMonth() + 1);
    const yearMonth = {year: year, month: month};
    return yearMonth;
}

/**
 * @param {Date} req.body.date
 * @param {string} req.body.email
 */
exports.getSubmittedShift = async (req, res, next) => {
    const yearMonth = getYearMonth(req.body.date);
    const fileName = yearMonth['year'] + '　' + yearMonth['month'] + '月キャストシフト提出';
    const fileList = await google.getAllFilesFromGDrive();
    const file = fileList.filter(file => file.name == fileName);
    const emailList = await google.getSubmittedEmailList(file[0].id);
    const emailIndex = emailList.flat().indexOf(req.body.email);
    const submittedShift = await google.getSubmittedShift(file[0].id, emailIndex);
    const shiftWithDate = [];
    const parsedMonth = ('0' + yearMonth['month']).slice(-2);
    for (var i = 1; i <= submittedShift.length; ++ i) {
        shiftWithDate.push({
            start: "20" + yearMonth['year'] + '-' + parsedMonth + '-' + ('0' + i).slice(-2),
            title: submittedShift[i - 1]
        })
    }
    res.json(shiftWithDate);
    res.end();
}
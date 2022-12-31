class DateUtils {
    static now() {
        const d = new Date();
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        return d;
    }

    static format(d, format = 'yyyy-MM-ddThh:mm:ss.millisZ') {
        let result = format;
        result = result.replace('yyyy', d.getFullYear().toString().padStart(4, '0'));
        result = result.replace('MM', (d.getMonth() + 1).toString().padStart(2, '0'));
        result = result.replace('dd', d.getDate().toString().padStart(2, '0'));
        result = result.replace('hh', d.getHours().toString().padStart(2, '0'));
        result = result.replace('mm', d.getMinutes().toString().padStart(2, '0'));
        result = result.replace('ss', d.getSeconds().toString().padStart(2, '0'));
        result = result.replace('millis', d.getMilliseconds().toString().padStart(3, '0'));
        return result;
    }

    static formatLocal(d, format = 'yyyy-MM-ddThh:mm:ss.millisZ') {
        const dateutc = new Date(d.getTime());
        dateutc.setMinutes(dateutc.getMinutes() - dateutc.getTimezoneOffset());
        return DateUtils.format(dateutc, format);
    }

    static fromLocal(dateStr, format = 'yyyy-MM-ddThh:mm:ss.millisZ') {
        let result = new Date();
        result.setFullYear(parseInt(dateStr.substr(format.indexOf('yyyy'), 4)));
        result.setMonth(parseInt(dateStr.substr(format.indexOf('MM'), 2)) - 1);
        result.setDate(parseInt(dateStr.substr(format.indexOf('dd'), 2)));
        result.setHours(parseInt(dateStr.substr(format.indexOf('hh'), 2)));
        result.setMinutes(parseInt(dateStr.substr(format.indexOf('mm'), 2)) + result.getTimezoneOffset());
        result.setSeconds(parseInt(dateStr.substr(format.indexOf('ss'), 2)));
        result.setMilliseconds(parseInt(dateStr.substr(format.indexOf('millis'), 3)));
        return result;
    }

    static fromUTC(dateStr, format = 'yyyy-MM-ddThh:mm:ss.millisZ') {
        let result = new Date();
        result.setFullYear(parseInt(dateStr.substr(format.indexOf('yyyy'), 4)));
        result.setMonth(parseInt(dateStr.substr(format.indexOf('MM'), 2)) - 1);
        result.setDate(parseInt(dateStr.substr(format.indexOf('dd'), 2)));
        result.setHours(parseInt(dateStr.substr(format.indexOf('hh'), 2)));
        result.setMinutes(parseInt(dateStr.substr(format.indexOf('mm'), 2)));
        result.setSeconds(parseInt(dateStr.substr(format.indexOf('ss'), 2)));
        result.setMilliseconds(parseInt(dateStr.substr(format.indexOf('millis'), 3)));
        return result;
    }
}

module.exports = DateUtils;